import {
    AddRounded,
    DeleteRounded,
    EditRounded,
    SearchRounded,
    ToggleOffRounded,
    ToggleOnRounded,
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

import {
    changeSlotStatus,
    createSlot,
    deleteSlot,
    getSlotsAdmin,
    updateSlot,
} from "../../services/api";

import type { Slot } from "../../types/api";

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

    const disabledSlots = slots.filter((s) => !s.active).length;

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
        try {
            setSaving(true);

            if (selectedSlot) {
                await updateSlot(selectedSlot.id, form);
            } else {
                await createSlot(form);
            }

            setOpenDialog(false);

            await loadSlots();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedSlot) return;

        await deleteSlot(selectedSlot.id);

        setDeleteDialog(false);

        loadSlots();
    };

    const handleToggle = async (slot: Slot) => {
        await changeSlotStatus(
            slot.id,
            !slot.active
        );

        loadSlots();
    };