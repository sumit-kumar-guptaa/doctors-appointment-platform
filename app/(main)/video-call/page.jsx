"use client";

// import { useEffect, useRef, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Script from "next/script";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Loader2,
//   Video,
//   VideoOff,
//   Mic,
//   MicOff,
//   PhoneOff,
//   User,
// } from "lucide-react";
// import { toast } from "sonner";

export default function VideoCallPage() {
  //   const [isLoading, setIsLoading] = useState(true);
  //   const [scriptLoaded, setScriptLoaded] = useState(false);
  //   const [isConnected, setIsConnected] = useState(false);
  //   const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  //   const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  //   const sessionRef = useRef(null);
  //   const publisherRef = useRef(null);

  //   const router = useRouter();
  //   const searchParams = useSearchParams();

  //   const sessionId = searchParams.get("sessionId");
  //   const token = searchParams.get("token");
  //   const apiKey = process.env.NEXT_PUBLIC_VONAGE_API_KEY;

  //   // Handle script load
  //   const handleScriptLoad = () => {
  //     setScriptLoaded(true);
  //     if (!window.OT) {
  //       toast.error("Failed to load Vonage Video API");
  //       setIsLoading(false);
  //       return;
  //     }
  //     initializeSession();
  //   };

  //   // Initialize video session
  //   const initializeSession = () => {
  //     if (!apiKey || !sessionId || !token) {
  //       toast.error("Missing required video call parameters");
  //       router.push("/appointments");
  //       return;
  //     }

  //     try {
  //       // Initialize the session
  //       sessionRef.current = window.OT.initSession(apiKey, sessionId);

  //       // Subscribe to new streams
  //       sessionRef.current.on("streamCreated", (event) => {
  //         sessionRef.current.subscribe(
  //           event.stream,
  //           "subscriber",
  //           {
  //             insertMode: "append",
  //             width: "100%",
  //             height: "100%",
  //           },
  //           (error) => {
  //             if (error) {
  //               toast.error("Error connecting to other participant's stream");
  //             }
  //           }
  //         );
  //       });

  //       // Handle session events
  //       sessionRef.current.on("sessionConnected", () => {
  //         setIsConnected(true);
  //         setIsLoading(false);
  //       });

  //       sessionRef.current.on("sessionDisconnected", () => {
  //         setIsConnected(false);
  //       });

  //       // Initialize the publisher
  //       publisherRef.current = window.OT.initPublisher(
  //         "publisher",
  //         {
  //           insertMode: "append",
  //           width: "100%",
  //           height: "100%",
  //         },
  //         (error) => {
  //           if (error) {
  //             toast.error("Error initializing your camera and microphone");
  //           }
  //         }
  //       );

  //       // Connect to the session
  //       sessionRef.current.connect(token, (error) => {
  //         if (error) {
  //           toast.error("Error connecting to video session");
  //         } else {
  //           sessionRef.current.publish(publisherRef.current, (error) => {
  //             if (error) {
  //               toast.error("Error publishing your stream");
  //             }
  //           });
  //         }
  //       });
  //     } catch (error) {
  //       toast.error("Failed to initialize video call");
  //       setIsLoading(false);
  //     }
  //   };

  //   // Toggle video
  //   const toggleVideo = () => {
  //     if (publisherRef.current) {
  //       publisherRef.current.publishVideo(!isVideoEnabled);
  //       setIsVideoEnabled((prev) => !prev);
  //     }
  //   };

  //   // Toggle audio
  //   const toggleAudio = () => {
  //     if (publisherRef.current) {
  //       publisherRef.current.publishAudio(!isAudioEnabled);
  //       setIsAudioEnabled((prev) => !prev);
  //     }
  //   };

  //   // End call
  //   const endCall = () => {
  //     if (sessionRef.current) {
  //       sessionRef.current.disconnect();
  //     }
  //     router.push("/appointments");
  //   };

  //   // Cleanup on unmount
  //   useEffect(() => {
  //     return () => {
  //       if (sessionRef.current) {
  //         sessionRef.current.disconnect();
  //       }
  //       if (publisherRef.current) {
  //         publisherRef.current.destroy();
  //       }
  //     };
  //   }, []);

  //   if (!sessionId || !token || !apiKey) {
  //     return (
  //       <div className="container mx-auto px-4 py-12 text-center">
  //         <h1 className="text-3xl font-bold text-white mb-4">
  //           Invalid Video Call
  //         </h1>
  //         <p className="text-muted-foreground mb-6">
  //           Missing required parameters for the video call.
  //         </p>
  //         <Button
  //           onClick={() => router.push("/appointments")}
  //           className="bg-emerald-600 hover:bg-emerald-700"
  //         >
  //           Back to Appointments
  //         </Button>
  //       </div>
  //     );
  //   }

  return (
    <div>hello</div>
    // <>
    //   <Script
    //     src="https://unpkg.com/@vonage/client-sdk-video@latest/dist/js/opentok.js"
    //     onLoad={handleScriptLoad}
    //     onError={() => {
    //       toast.error("Failed to load video call script");
    //       setIsLoading(false);
    //     }}
    //   />

    //   <div className="container mx-auto px-4 py-8">
    //     <div className="text-center mb-6">
    //       <h1 className="text-3xl font-bold text-white mb-2">
    //         Video Consultation
    //       </h1>
    //       <p className="text-muted-foreground">
    //         {isConnected
    //           ? "Connected"
    //           : isLoading
    //           ? "Connecting..."
    //           : "Connection failed"}
    //       </p>
    //     </div>

    //     {isLoading && !scriptLoaded ? (
    //       <div className="flex flex-col items-center justify-center py-12">
    //         <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
    //         <p className="text-white text-lg">
    //           Loading video call components...
    //         </p>
    //       </div>
    //     ) : (
    //       <div className="space-y-6">
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //           {/* Publisher (Your video) */}
    //           <Card className="border-emerald-900/20 overflow-hidden">
    //             <CardContent className="p-0 relative">
    //               <div
    //                 id="publisher"
    //                 className="w-full h-[300px] md:h-[400px] bg-muted/30"
    //               >
    //                 {!scriptLoaded && (
    //                   <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
    //                     <div className="bg-muted/20 rounded-full p-8 mb-4">
    //                       <User className="h-12 w-12 text-emerald-400" />
    //                     </div>
    //                   </div>
    //                 )}
    //               </div>
    //             </CardContent>
    //           </Card>

    //           {/* Subscriber (Other person's video) */}
    //           <Card className="border-emerald-900/20 overflow-hidden">
    //             <CardContent className="p-0 relative">
    //               <div
    //                 id="subscriber"
    //                 className="w-full h-[300px] md:h-[400px] bg-muted/30"
    //               >
    //                 {(!isConnected || !scriptLoaded) && (
    //                   <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
    //                     <div className="bg-muted/20 rounded-full p-8 mb-4">
    //                       <User className="h-12 w-12 text-emerald-400" />
    //                     </div>
    //                   </div>
    //                 )}
    //               </div>
    //             </CardContent>
    //           </Card>
    //         </div>

    //         {/* Video controls */}
    //         <div className="flex justify-center space-x-4">
    //           <Button
    //             variant="outline"
    //             size="lg"
    //             onClick={toggleVideo}
    //             className={`rounded-full p-4 h-14 w-14 ${
    //               isVideoEnabled
    //                 ? "border-emerald-900/30"
    //                 : "bg-red-900/20 border-red-900/30 text-red-400"
    //             }`}
    //             disabled={!isConnected || isLoading}
    //           >
    //             {isVideoEnabled ? <Video /> : <VideoOff />}
    //           </Button>

    //           <Button
    //             variant="outline"
    //             size="lg"
    //             onClick={toggleAudio}
    //             className={`rounded-full p-4 h-14 w-14 ${
    //               isAudioEnabled
    //                 ? "border-emerald-900/30"
    //                 : "bg-red-900/20 border-red-900/30 text-red-400"
    //             }`}
    //             disabled={!isConnected || isLoading}
    //           >
    //             {isAudioEnabled ? <Mic /> : <MicOff />}
    //           </Button>

    //           <Button
    //             variant="destructive"
    //             size="lg"
    //             onClick={endCall}
    //             className="rounded-full p-4 h-14 w-14 bg-red-600 hover:bg-red-700"
    //           >
    //             <PhoneOff />
    //           </Button>
    //         </div>

    //         <div className="text-center">
    //           <p className="text-muted-foreground text-sm">
    //             When you're finished with your consultation, click the red
    //             button to end the call
    //           </p>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </>
  );
}
