import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
    onScan: (token: string) => void;
}

export default function QrScanner({
                                      onScan,
                                  }: Props) {

    useEffect(() => {

        const scanner =
            new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250,
                    },
                },
                false
            );

        scanner.render(

            (decodedText) => {

                scanner
                    .clear()
                    .catch(() => {});

                onScan(decodedText);

            },

            () => {}

        );

        return () => {

            scanner
                .clear()
                .catch(() => {});

        };

    }, []);

    return (
        <div
            id="reader"
            style={{
                width: "100%",
            }}
        />
    );

}