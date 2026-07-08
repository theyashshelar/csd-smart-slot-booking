import type {Components, Theme} from "@mui/material";

export const components: Components<Omit<Theme, "components">> = {

    MuiButton: {

        styleOverrides: {

            root: {

                borderRadius: 16,

                textTransform: "none",

                fontWeight: 700,

                padding: "12px 26px",

                transition: ".25s",

            },

            contained: {

                boxShadow: "0 8px 24px rgba(0,0,0,.10)",

                "&:hover": {

                    transform: "translateY(-3px)",

                    boxShadow: "0 16px 32px rgba(0,0,0,.18)",

                },

            },

            outlined: {

                "&:hover": {

                    transform: "translateY(-3px)",

                },

            },

        },

    },

    MuiCard: {

        styleOverrides: {

            root: {

                borderRadius: 24,

                boxShadow: "0 10px 30px rgba(15,23,42,.06)",

                transition: ".30s",

                border: "1px solid rgba(0,0,0,.04)",

                "&:hover": {

                    transform: "translateY(-8px)",

                    boxShadow: "0 22px 40px rgba(0,0,0,.10)",

                },

            },

        },

    },

    MuiChip: {

        styleOverrides: {

            root: {

                borderRadius: 999,

                fontWeight: 600,

            },

        },

    },

};