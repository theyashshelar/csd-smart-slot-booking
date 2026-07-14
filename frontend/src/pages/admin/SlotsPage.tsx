import {
    AddRounded,
    DeleteRounded,
    EditRounded,
    SearchRounded,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { formatTime12h, formatSlotLabel } from "../../utils/timeFormatter";

import {
    changeSlotStatus,
    createSlot,
    deleteSlot,
    getSlotsAdmin,
    updateSlot,
    getSettings,
} from "../../services/api";

import type { Slot, SettingsItem } from "../../types/api";

function parseTimeToMinutes(timeStr: string): number | null {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

function parseHHMMToMinutes(timeStr: string): number {
    const parts = timeStr.split(":");
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return h * 60 + m;
}

interface SlotForm {
    label: string;
    cardType: "GROCERY" | "LIQUOR";
    startTime: string;
    endTime: string;
    capacity: number;
}

const emptyForm: SlotForm = {
    label: "",
    cardType: "GROCERY",
    startTime: "",
    endTime: "",
    capacity: 25,
};

export default function SlotsPage() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("ALL");

    const [openDialog, setOpenDialog] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState(false);

    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

    const [form, setForm] = useState<SlotForm>(emptyForm);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [settings, setSettings] = useState<Record<string, string>>({});

    const loadSlots = async () => {
        try {
            setLoading(true);

            const res = await getSlotsAdmin();

            setSlots(res.data ?? []);
        } catch (e: any) {
            setError(e?.response?.data || "Unable to load slots.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSlots();
        getSettings()
            .then((res) => {
                const mapped = ((res.data || []) as SettingsItem[]).reduce<Record<string, string>>((acc, item) => {
                    if (item.keyName) acc[item.keyName] = item.settingValue || "";
                    return acc;
                }, {});
                setSettings(mapped);
            })
            .catch((err) => console.error("Failed to load settings in slots page", err));
    }, []);

    const filteredSlots = useMemo(() => {
        return slots.filter((slot) => {
            const keyword =
                slot.label.toLowerCase().includes(search.toLowerCase()) ||
                slot.startTime.toLowerCase().includes(search.toLowerCase()) ||
                slot.endTime.toLowerCase().includes(search.toLowerCase());

            if (filter === "ACTIVE")
                return keyword && slot.active;

            if (filter === "DISABLED")
                return keyword && !slot.active;

            if (filter === "GROCERY")
                return keyword && slot.cardType === "GROCERY";

            if (filter === "LIQUOR")
                return keyword && slot.cardType === "LIQUOR";

            return keyword;
        });
    }, [slots, search, filter]);

    const totalCapacity = slots.reduce(
        (sum, s) => sum + s.capacity,
        0
    );

    const totalBooked = slots.reduce(
        (sum, s) => sum + s.bookedCount,
        0
    );

    const occupancy = totalCapacity
        ? Math.round((totalBooked / totalCapacity) * 100)
        : 0;

    const activeSlots = slots.filter((s) => s.active).length;

    const handleCreate = () => {
        setSelectedSlot(null);

        setForm(emptyForm);

        setOpenDialog(true);
    };

    const handleEdit = (slot: Slot) => {
        setSelectedSlot(slot);

        setForm({
            label: slot.label,
            cardType: slot.cardType,
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacity: slot.capacity,
        });

        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!form.label.trim()) {
            setError("Slot Label is required.");
            toast.error("Slot Label is required.");
            return;
        }
        if (!form.startTime.trim()) {
            setError("Start Time is required.");
            toast.error("Start Time is required.");
            return;
        }
        if (!form.endTime.trim()) {
            setError("End Time is required.");
            toast.error("End Time is required.");
            return;
        }
        if (!form.capacity || form.capacity <= 0) {
            setError("Capacity must be greater than 0.");
            toast.error("Capacity must be greater than 0.");
            return;
        }

        const startMin = parseHHMMToMinutes(form.startTime);
        const endMin = parseHHMMToMinutes(form.endTime);

        // Rule 4: Start Time must always be earlier than End Time
        if (startMin >= endMin) {
            setError("Slot Start Time must be earlier than Slot End Time.");
            toast.error("Slot Start Time must be earlier than Slot End Time.");
            return;
        }

        // Rule 1: Slot Start Time must be >= Opening Time
        const opStr = settings.openingTime || "09:00 AM";
        const opMin = parseTimeToMinutes(opStr) ?? (9 * 60);
        if (startMin < opMin) {
            setError(`Slot Start Time must be at or after Canteen Opening Time (${opStr}).`);
            toast.error(`Slot Start Time must be at or after Canteen Opening Time (${opStr}).`);
            return;
        }

        // Rule 2: Slot End Time must be <= Closing Time
        const clStr = settings.closingTime || "05:00 PM";
        const clMin = parseTimeToMinutes(clStr) ?? (17 * 60);
        if (endMin > clMin) {
            setError(`Slot End Time must be at or before Canteen Closing Time (${clStr}).`);
            toast.error(`Slot End Time must be at or before Canteen Closing Time (${clStr}).`);
            return;
        }

        // Rule 3: A slot must NOT overlap the configured Lunch Break
        const lhStartStr = settings.lunchBreakStart || "01:00 PM";
        const lhEndStr = settings.lunchBreakEnd || "02:00 PM";
        const lhStartMin = parseTimeToMinutes(lhStartStr) ?? (13 * 60);
        const lhEndMin = parseTimeToMinutes(lhEndStr) ?? (14 * 60);

        if (startMin < lhEndMin && lhStartMin < endMin) {
            setError(`Slot must not overlap the configured Lunch Break (${lhStartStr} - ${lhEndStr}).`);
            toast.error(`Slot must not overlap the configured Lunch Break (${lhStartStr} - ${lhEndStr}).`);
            return;
        }

        // Rule 5: Capacity entered while creating/editing a slot must NOT exceed the configured capacity for that card type
        if (form.cardType === "GROCERY") {
            const maxGrocery = settings.groceryCapacity ? parseInt(settings.groceryCapacity, 10) : 50;
            if (form.capacity > maxGrocery) {
                setError(`Capacity for Grocery slot cannot exceed configured maximum of ${maxGrocery}.`);
                toast.error(`Capacity for Grocery slot cannot exceed configured maximum of ${maxGrocery}.`);
                return;
            }
        } else if (form.cardType === "LIQUOR") {
            const maxLiquor = settings.liquorCapacity ? parseInt(settings.liquorCapacity, 10) : 30;
            if (form.capacity > maxLiquor) {
                setError(`Capacity for Liquor slot cannot exceed configured maximum of ${maxLiquor}.`);
                toast.error(`Capacity for Liquor slot cannot exceed configured maximum of ${maxLiquor}.`);
                return;
            }
        }

        try {
            setSaving(true);
            setError("");

            if (selectedSlot) {
                await updateSlot(selectedSlot.id, form);
                toast.success("Slot updated successfully!");
            } else {
                await createSlot(form);
                toast.success("Slot created successfully!");
            }

            setOpenDialog(false);
            await loadSlots();
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.response?.data || "Unable to save slot.";
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedSlot) return;

        try {
            await deleteSlot(selectedSlot.id);
            toast.success("Slot deleted successfully!");
            setDeleteDialog(false);
            loadSlots();
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.response?.data || "Unable to delete slot.";
            setError(errMsg);
            toast.error(errMsg);
        }
    };

    const handleToggle = async (slot: Slot) => {
        try {
            await changeSlotStatus(
                slot.id,
                !slot.active
            );
            toast.success(`Slot ${!slot.active ? "activated" : "deactivated"} successfully!`);
            loadSlots();
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.response?.data || "Unable to toggle slot status.";
            setError(errMsg);
            toast.error(errMsg);
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Time Slots</Typography>
                    <Typography variant="body2" color="text.secondary">Configure canteen operational hours and capacities</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddRounded />} onClick={handleCreate} sx={{ height: 38 }}>
                    Add Slot
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError("")}>{error}</Alert>}

            {/* Quick Metrics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography color="text.secondary" variant="body2" fontWeight={500}>Total Slots</Typography>
                            <Typography variant="h5" sx={{ mt: 0.4, fontWeight: 700, color: '#111827' }}>{slots.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography color="text.secondary" variant="body2" fontWeight={500}>Active Slots</Typography>
                            <Typography variant="h5" sx={{ mt: 0.4, fontWeight: 700, color: '#2E7D32' }}>{activeSlots}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography color="text.secondary" variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>Overall Occupancy</Typography>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>{occupancy}%</Typography>
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgress variant="determinate" value={occupancy} sx={{ height: 6, borderRadius: '6px', bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { bgcolor: '#2E7D32' } }} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters & Search */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                    placeholder="Search slots..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRounded color="action" sx={{ fontSize: '1.2rem' }} />
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    size="small"
                />
                <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="ALL">All Slots</MenuItem>
                    <MenuItem value="ACTIVE">Active Only</MenuItem>
                    <MenuItem value="DISABLED">Inactive Only</MenuItem>
                    <MenuItem value="GROCERY">Grocery Only</MenuItem>
                    <MenuItem value="LIQUOR">Liquor Only</MenuItem>
                </Select>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress color="success" />
                </Box>
            ) : filteredSlots.length === 0 ? (
                <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed #D1D5DB', borderRadius: '12px' }}>
                    <Typography color="text.secondary" variant="body2">No time slots found matching filters</Typography>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    {filteredSlots.map((slot) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={slot.id}>
                            <motion.div layout>
                                <Card sx={{ border: '1px solid #E5E7EB', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', borderRadius: '12px', bgcolor: '#FFFFFF', opacity: slot.active ? 1 : 0.7 }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight={600} color="#111827">{formatSlotLabel(slot.label)}</Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    {!slot.active && (
                                                        <Chip
                                                            label="Inactive"
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                            sx={{ borderRadius: '999px', fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    )}
                                                    <Chip
                                                        label={slot.cardType}
                                                        size="small"
                                                        color={slot.cardType === 'GROCERY' ? 'primary' : 'secondary'}
                                                        sx={{ borderRadius: '999px', fontSize: '0.7rem', height: 20 }}
                                                    />
                                                </Stack>
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                Time: {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                                            </Typography>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" fontWeight="medium">
                                                    Booked: {slot.bookedCount} / {slot.capacity}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleEdit(slot)}>
                                                            <EditRounded sx={{ fontSize: '1.1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => { setSelectedSlot(slot); setDeleteDialog(true); }}>
                                                            <DeleteRounded sx={{ fontSize: '1.1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={slot.active ? "Deactivate" : "Activate"}>
                                                        <Switch
                                                            size="small"
                                                            checked={slot.active}
                                                            onChange={() => handleToggle(slot)}
                                                        />
                                                    </Tooltip>
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedSlot ? 'Edit Time Slot' : 'Create Time Slot'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Stack spacing={2}>
                            <TextField
                                label="Slot Label"
                                placeholder="e.g. 09:00 - 10:00"
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                fullWidth
                                required
                                size="small"
                            />
                            <FormControl fullWidth size="small">
                                <Select
                                    value={form.cardType}
                                    onChange={(e) => setForm({ ...form, cardType: e.target.value as 'GROCERY' | 'LIQUOR' })}
                                >
                                    <MenuItem value="GROCERY">Grocery</MenuItem>
                                    <MenuItem value="LIQUOR">Liquor</MenuItem>
                                </Select>
                            </FormControl>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Start Time"
                                    type="time"
                                    value={form.startTime}
                                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    required
                                    size="small"
                                />
                                <TextField
                                    label="End Time"
                                    type="time"
                                    value={form.endTime}
                                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    required
                                    size="small"
                                />
                            </Stack>
                            <TextField
                                label="Capacity"
                                type="number"
                                value={form.capacity}
                                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                                fullWidth
                                required
                                size="small"
                            />
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete Time Slot?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this time slot? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}