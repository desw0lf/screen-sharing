"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Monitor, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Peer from "peerjs";
import { useEffect, useState } from "react";

export default function HostPage() {
    const [roomId, setRoomId] = useState<string>("");
    const [peer, setPeer] = useState<Peer | null>(null);
    const [viewers, setViewers] = useState<number>(0);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        try {
            const newPeer = new Peer();

            setPeer(newPeer);

            newPeer.on("open", (id) => {
                setRoomId(id);
            });

            newPeer.on("connection", (conn) => {
                setViewers((prev) => prev + 1);

                conn.on("close", () => {
                    setViewers((prev) => prev - 1);
                });

                toast({
                    title: "New viewer connected",
                    description: "Click to start sharing your screen",
                    duration: Infinity,
                    action: (
                        <ToastAction
                            altText="Start sharing"
                            onClick={async () => {
                                try {
                                    const stream = await navigator.mediaDevices.getDisplayMedia({
                                        video: true,
                                        audio: true
                                    });
                                    setActiveStream(stream);
                                    const call = newPeer.call(conn.peer, stream);

                                    stream.getVideoTracks()[0].onended = () => {
                                        call.close();
                                        stream.getTracks().forEach((track) => track.stop());
                                    };
                                } catch (err) {
                                    console.error("Screen sharing error:", err);
                                    toast({
                                        title: "Screen sharing error",
                                        description: "Failed to start screen sharing. Please try again.",
                                        variant: "destructive"
                                    });
                                }
                            }}>
                            Start Sharing
                        </ToastAction>
                    )
                });
            });

            return () => {
                newPeer.destroy();
            };
        } catch (error) {
            console.error("Error initializing peer:", error);
        }
    }, []);

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        toast({
            title: "Room code copied!",
            description: "Share this code with others to let them join your room."
        });
    };

    const endSession = () => {
        if (activeStream) {
            activeStream.getTracks().forEach((track) => track.stop());
            setActiveStream(null);
        }

        if (peer) {
            peer.destroy();
            setPeer(null);
        }

        setViewers(0);
        setRoomId("");

        toast({
            title: "Session ended",
            description: "Your screen sharing session has been terminated."
        });

        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-6 w-6" />
                            Your Screen Sharing Room
                        </CardTitle>
                        <CardDescription>Share this room code with others to let them view your screen</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-lg font-mono">{roomId || "Generating room code..."}</code>
                            <Button variant="outline" size="icon" onClick={copyRoomId} disabled={!roomId}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-500" />
                                <span className="text-sm text-gray-500">Current Viewers</span>
                            </div>
                            <span className="text-lg font-semibold">{viewers}</span>
                        </div>

                        {activeStream && (
                            <div className="flex justify-end pt-4">
                                <Button variant="destructive" onClick={endSession} className="flex items-center gap-2">
                                    Stop sharing
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
