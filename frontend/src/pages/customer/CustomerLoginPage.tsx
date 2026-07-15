import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Stack,
    TextField,
    Typography,
    Alert,
    IconButton,
    InputAdornment,
} from "@mui/material";

import {
    ArrowForwardRounded,
    LockRounded,
    PersonRounded,
    QrCode2Rounded,
    VerifiedRounded,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";

import { useState, useRef, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { loginCustomer } from "../../services/auth";
import { toast } from 'react-hot-toast'

export default function CustomerLoginPage() {

    const [mobileNumber, setMobileNumber] = useState("");

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const phoneRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        phoneRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mobileNumber.trim()) {
            setError("Mobile Number is required.");
            toast.error("Mobile Number is required.");
            phoneRef.current?.focus();
            return;
        }

        if (!password) {
            setError("Password is required.");
            toast.error("Password is required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {

            await loginCustomer(
                mobileNumber,
                password
            );

            toast.success("Logged in successfully!");
            navigate("/customer/dashboard");

        } catch (e: any) {

            const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Login Failed";
            setError(msg);
            toast.error(msg);

        } finally {

            setLoading(false);

        }

    };
    return (
        <Box
            sx={{
                minHeight: "85vh",
                display: "flex",
                alignItems: "center",
                py: 4,
            }}
        >
            <Grid
                container
                spacing={4}
                alignItems="center"
            >
                {/* LEFT */}

                <Grid size={{ xs: 12, md: 6 }}>

                    <Stack spacing={3}>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 42,
                                    md: 58,
                                },
                                fontWeight: 700,
                                color: '#111827',
                                letterSpacing: '-0.025em',
                                lineHeight: 1.15,
                            }}
                        >
                            Welcome Back
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ maxWidth: 480 }}
                        >
                            Sign in to continue to your CSD Smart Slot Booking account and manage your appointments.
                        </Typography>

                        <Stack spacing={2} sx={{ pt: 1 }}>

                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <Box sx={{ display: 'flex', color: '#2E7D32' }}>
                                    <VerifiedRounded sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                                    Secure Authentication
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <Box sx={{ display: 'flex', color: '#D4A017' }}>
                                    <QrCode2Rounded sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                                    Instant QR Token Access
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <Box sx={{ display: 'flex', color: '#374151' }}>
                                    <LockRounded sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                                    Encrypted Member Login
                                </Typography>
                            </Stack>

                        </Stack>

                    </Stack>

                </Grid>

                {/* RIGHT */}

                <Grid size={{ xs: 12, md: 6 }}>

                    <Card sx={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>

                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>

                            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                                <Stack spacing={2.5}>

                                    <Stack
                                        alignItems="center"
                                        spacing={1}
                                        sx={{ textAlign: 'center' }}
                                    >

                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: "10px",
                                                bgcolor: "rgba(46,125,50,0.10)",
                                                color: "#2E7D32",
                                                display: "grid",
                                                placeItems: "center",
                                            }}
                                        >
                                            <PersonRounded
                                                sx={{ fontSize: 28 }}
                                            />
                                        </Box>

                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            color="#111827"
                                        >
                                            Customer Login
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Login using your registered mobile
                                            number and password.
                                        </Typography>

                                    </Stack>

                                    {error && (

                                        <Alert severity="error" sx={{ borderRadius: '10px' }}>

                                            {error}

                                        </Alert>

                                    )}

                                    <TextField
                                        label="Mobile Number"
                                        fullWidth
                                        size="small"
                                        value={mobileNumber}
                                        onChange={(e) =>
                                            setMobileNumber(e.target.value)
                                        }
                                        inputRef={phoneRef}
                                        disabled={loading}
                                        slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                                    />

                                    <TextField
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        size="small"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        disabled={loading}
                                        slotProps={{ htmlInput: { style: { borderRadius: '10px' } } }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        endIcon={<ArrowForwardRounded />}
                                        disabled={loading}
                                        sx={{
                                            height: 40,
                                            borderRadius: "10px",
                                        }}
                                    >
                                        {loading ? "Signing In..." : "Sign In"}
                                    </Button>

                                    <Button
                                        component={RouterLink}
                                        to="/customer/register"
                                        variant="text"
                                        size="small"
                                        disabled={loading}
                                        sx={{ textTransform: 'none', fontWeight: 500 }}
                                    >
                                        New Member? Create an Account
                                    </Button>

                                </Stack>
                            </Box>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    )
}