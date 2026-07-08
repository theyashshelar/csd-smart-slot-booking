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
} from "@mui/material";

import {
    ArrowForwardRounded,
    LockRounded,
    PersonRounded,
    QrCode2Rounded,
    VerifiedRounded,
} from "@mui/icons-material";

import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { loginCustomer } from "../../services/auth";

export default function CustomerLoginPage() {

    const [mobileNumber, setMobileNumber] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async () => {

        setLoading(true);

        setError(null);

        try {

            await loginCustomer(
                mobileNumber,
                password
            );

            navigate("/customer/dashboard");

        } catch (e: any) {

            setError(
                e?.response?.data?.message ||
                e?.message ||
                "Login Failed"
            );

        } finally {

            setLoading(false);

        }

    };
    return (
        <Box
            sx={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
                py: 6,
            }}
        >
            <Grid
                container
                spacing={6}
                alignItems="center"
            >
                {/* LEFT */}

                <Grid size={{ xs: 12, md: 6 }}>

                    <Stack spacing={4}>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 42,
                                    md: 58,
                                },
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            Welcome Back
                        </Typography>

                        <Typography
                            variant="h6"
                            color="text.secondary"
                        >
                            Sign in to continue to your
                            CSD Smart Slot Booking account.
                        </Typography>

                        <Stack spacing={2}>

                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <VerifiedRounded color="success" />
                                <Typography>
                                    Secure Authentication
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <QrCode2Rounded color="primary" />
                                <Typography>
                                    Instant QR Token Access
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <LockRounded color="warning" />
                                <Typography>
                                    Encrypted Member Login
                                </Typography>
                            </Stack>

                        </Stack>

                    </Stack>

                </Grid>

                {/* RIGHT */}

                <Grid size={{ xs: 12, md: 6 }}>

                    <Card>

                        <CardContent sx={{ p: 5 }}>

                            <Stack spacing={3}>

                                <Stack
                                    alignItems="center"
                                    spacing={2}
                                >

                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "50%",
                                            bgcolor: "primary.main",
                                            color: "#fff",
                                            display: "grid",
                                            placeItems: "center",
                                        }}
                                    >
                                        <PersonRounded
                                            sx={{ fontSize: 40 }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="h4"
                                        fontWeight={700}
                                    >
                                        Customer Login
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        textAlign="center"
                                    >
                                        Login using your registered mobile
                                        number and password.
                                    </Typography>

                                </Stack>

                                {error && (

                                    <Alert severity="error">

                                        {error}

                                    </Alert>

                                )}

                                <TextField
                                    label="Mobile Number"
                                    fullWidth
                                    value={mobileNumber}
                                    onChange={(e) =>
                                        setMobileNumber(e.target.value)
                                    }
                                />

                                <TextField
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <Button
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    endIcon={<ArrowForwardRounded />}
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    sx={{
                                        py: 1.5,
                                    }}
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                </Button>

                                <Button
                                    component={RouterLink}
                                    to="/customer/register"
                                    variant="text"
                                >
                                    New Member? Create an Account
                                </Button>

                            </Stack>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    )
}