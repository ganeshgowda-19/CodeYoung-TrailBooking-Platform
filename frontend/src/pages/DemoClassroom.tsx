import React, { useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  MessageSquare,
  Clock,
  Send,
  XCircle,
  RefreshCw,
  AlertTriangle,
  GripVertical,
  Hand,
  Lock,
  Crown,
  UserCheck,
  CheckCircle2,
  Code,
  Terminal,
  Sparkles,
  Play,
  Volume2,
  Palette,
} from 'lucide-react';

export const DemoClassroom: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [roleMode, setRoleMode] = useState<'STUDENT' | 'MENTOR'>(() => {
    return searchParams.get('role') === 'mentor' ? 'MENTOR' : 'STUDENT';
  });

  const isMentor = searchParams.get('role') === 'mentor' || roleMode === 'MENTOR';

  const toggleRoleMode = () => {
    const nextRole = roleMode === 'MENTOR' ? 'STUDENT' : 'MENTOR';
    setRoleMode(nextRole);
    if (nextRole === 'MENTOR') {
      setSearchParams({ role: 'mentor' });
    } else {
      setSearchParams({});
    }
  };

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'CODE_EDITOR' | 'WHITEBOARD' | 'LIVE_VIDEO'>('CODE_EDITOR');
  const [codeContent, setCodeContent] = useState<string>(
    `# 🚀 1:1 Live Coding Sandbox & Demo Class\n# Topic: 3D Interactive Web Development & AI\n\ndef start_lesson():\n    print("Welcome to your 1:1 Live Coding Trial Class!")\n    print("Building interactive 3D world with Python & Javascript...")\n\nstart_lesson()`
  );
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '⚡ CodeYoung 1:1 Live Python Environment Ready.',
    'Click "▶ Run Code" to execute code live on screen!'
  ]);
  const [isExecutingCode, setIsExecutingCode] = useState(false);

  // 30-Minute Commencement Countdown Timer & Auto Wind-Up State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1800); // 30 minutes = 1800s
  const [isAutoWoundUp, setIsAutoWoundUp] = useState(false);

  React.useEffect(() => {
    if (isCallEnded || isAutoWoundUp || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto wind-up after 30 minutes
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
          }
          setIsAutoWoundUp(true);
          setIsCallEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCallEnded, isAutoWoundUp, timeLeftSeconds]);

  const formatCommencementTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');

    return `${hh}:${mm}:${ss}`; // e.g. 00:30:00
  };

  const handleRunCode = () => {
    setIsExecutingCode(true);
    setConsoleOutput((prev) => [...prev, '🔄 Executing Python code...']);
    setTimeout(() => {
      setIsExecutingCode(false);
      setConsoleOutput([
        '⚡ CodeYoung 1:1 Live Python Environment Ready.',
        `[Output]: Welcome to your 1:1 Live Coding Trial Class!`,
        `[Output]: Building interactive 3D world with Python & Javascript...`,
        '✅ Process finished with exit code 0'
      ]);
    }, 600);
  };

  const handleSendReaction = (emoji: string) => {
    const reactionId = Date.now() + Math.random();
    const randomX = Math.floor(Math.random() * 60) + 20;
    setFloatingReactions((prev) => [...prev, { id: reactionId, emoji, x: randomX }]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 2500);
  };

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const studentVideoRef = useRef<HTMLVideoElement>(null);
  const mainStudentVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Real Screen Sharing WebRTC Streams (Google Meet / Zoom style)
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  const toggleScreenShare = async () => {
    if (isSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setIsSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = stream;
        setIsSharing(true);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            screenStreamRef.current = null;
            setIsSharing(false);
          };
        }
      } catch (err: any) {
        console.warn('Screen share cancelled or permission denied:', err);
        setIsSharing(false);
      }
    }
  };

  React.useEffect(() => {
    if (isSharing && screenStreamRef.current && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [isSharing]);

  // Floating Draggable & Resizable User Camera Tile (Google Meet / Zoom style)
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [userTilePos, setUserTilePos] = useState<{ x: number; y: number } | null>(null);
  const [userTileSize, setUserTileSize] = useState<{ width: number; height: number }>({ width: 250, height: 160 });
  const [isDraggingTile, setIsDraggingTile] = useState(false);
  const [isResizingTile, setIsResizingTile] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const resizeStartRef = useRef<{ startX: number; startY: number; initialW: number; initialH: number }>({
    startX: 0,
    startY: 0,
    initialW: 250,
    initialH: 160,
  });

  const handleTileMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.tile-resize-handle')) return;
    e.preventDefault();
    setIsDraggingTile(true);

    const containerRect = videoContainerRef.current?.getBoundingClientRect();
    const tileElem = (e.currentTarget as HTMLElement).closest('.draggable-user-tile') as HTMLElement;
    const tileRect = tileElem?.getBoundingClientRect();

    const currentX = userTilePos
      ? userTilePos.x
      : containerRect && tileRect
      ? containerRect.width - tileRect.width - 20
      : 20;
    const currentY = userTilePos
      ? userTilePos.y
      : containerRect && tileRect
      ? containerRect.height - tileRect.height - 20
      : 20;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };
  };

  const handleTileTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.tile-resize-handle')) return;
    if (e.touches.length !== 1) return;
    setIsDraggingTile(true);

    const touch = e.touches[0];
    const containerRect = videoContainerRef.current?.getBoundingClientRect();
    const tileElem = (e.currentTarget as HTMLElement).closest('.draggable-user-tile') as HTMLElement;
    const tileRect = tileElem?.getBoundingClientRect();

    const currentX = userTilePos
      ? userTilePos.x
      : containerRect && tileRect
      ? containerRect.width - tileRect.width - 20
      : 20;
    const currentY = userTilePos
      ? userTilePos.y
      : containerRect && tileRect
      ? containerRect.height - tileRect.height - 20
      : 20;

    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: currentX,
      initialY: currentY,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingTile(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialW: userTileSize.width,
      initialH: userTileSize.height,
    };
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    setIsResizingTile(true);
    const touch = e.touches[0];
    resizeStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialW: userTileSize.width,
      initialH: userTileSize.height,
    };
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingTile) {
        const dx = e.clientX - resizeStartRef.current.startX;
        const dy = e.clientY - resizeStartRef.current.startY;
        const newW = Math.max(160, Math.min(480, resizeStartRef.current.initialW + dx));
        const newH = Math.max(110, Math.min(320, resizeStartRef.current.initialH + dy));
        setUserTileSize({ width: newW, height: newH });
        return;
      }

      if (!isDraggingTile || !videoContainerRef.current) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;

      const containerRect = videoContainerRef.current.getBoundingClientRect();
      const tileWidth = userTileSize.width;
      const tileHeight = userTileSize.height;

      const maxX = Math.max(0, containerRect.width - tileWidth);
      const maxY = Math.max(0, containerRect.height - tileHeight);

      const newX = Math.max(8, Math.min(maxX - 8, dragStartRef.current.initialX + dx));
      const newY = Math.max(8, Math.min(maxY - 8, dragStartRef.current.initialY + dy));

      setUserTilePos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      if (isResizingTile) {
        const dx = touch.clientX - resizeStartRef.current.startX;
        const dy = touch.clientY - resizeStartRef.current.startY;
        const newW = Math.max(150, Math.min(420, resizeStartRef.current.initialW + dx));
        const newH = Math.max(100, Math.min(280, resizeStartRef.current.initialH + dy));
        setUserTileSize({ width: newW, height: newH });
        return;
      }

      if (!isDraggingTile || !videoContainerRef.current) return;
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;

      const containerRect = videoContainerRef.current.getBoundingClientRect();
      const tileWidth = userTileSize.width;
      const tileHeight = userTileSize.height;

      const maxX = Math.max(0, containerRect.width - tileWidth);
      const maxY = Math.max(0, containerRect.height - tileHeight);

      const newX = Math.max(8, Math.min(maxX - 8, dragStartRef.current.initialX + dx));
      const newY = Math.max(8, Math.min(maxY - 8, dragStartRef.current.initialY + dy));

      setUserTilePos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingTile(false);
      setIsResizingTile(false);
    };
    const handleTouchEnd = () => {
      setIsDraggingTile(false);
      setIsResizingTile(false);
    };

    if (isDraggingTile || isResizingTile) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingTile, isResizingTile, userTileSize]);

  const handleHangUp = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (bookingReference) {
      api.sendParentExitAlert(bookingReference).catch((err) => console.warn('Parent exit alert error:', err));
    }
    setIsCallEnded(true);
  };

  // Warn student & dispatch parent alert beacon if tab/window is closed early
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isCallEnded && bookingReference) {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(`/api/bookings/${bookingReference}/parent-alert`);
        }
        e.preventDefault();
        e.returnValue = 'You are currently in a live 1:1 trial session. Exiting will notify your parent via Email & SMS.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [bookingReference, isCallEnded]);

  const handleRejoin = () => {
    setIsCallEnded(false);
    setIsVideoOn(true);
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: 'Welcome to your TrialFlow Live Demo Class!', time: 'Just now' },
    { sender: 'Mentor', text: "Hello! Welcome to our 1-on-1 trial session. I can see you on live camera!", time: 'Just now' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  React.useEffect(() => {
    if (isChatOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatMessages, isChatOpen]);

  const attachStreamToVideoRefs = (stream: MediaStream) => {
    if (studentVideoRef.current) {
      studentVideoRef.current.srcObject = stream;
    }
    if (mainStudentVideoRef.current) {
      mainStudentVideoRef.current.srcObject = stream;
    }
  };

  const requestCameraAccess = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices?.getUserMedia({ video: true, audio: true });
      if (stream) {
        mediaStreamRef.current = stream;
        attachStreamToVideoRefs(stream);
        stream.getAudioTracks().forEach((track) => { track.enabled = isMicOn; });
        stream.getVideoTracks().forEach((track) => { track.enabled = isVideoOn; });
      }
    } catch (err: any) {
      console.warn('Webcam camera access error:', err);
      setCameraError(err?.message || 'Camera permission denied or device not found.');
    }
  };

  // Enable Real Webcam Camera Feed automatically
  React.useEffect(() => {
    let isMounted = true;
    if (isVideoOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          mediaStreamRef.current = stream;
          attachStreamToVideoRefs(stream);
          stream.getAudioTracks().forEach((track) => { track.enabled = isMicOn; });
          stream.getVideoTracks().forEach((track) => { track.enabled = isVideoOn; });
          setCameraError(null);
        })
        .catch((err: any) => {
          console.warn('Webcam camera access error:', err);
          setCameraError('Camera access required so mentor can see you.');
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isVideoOn]);

  React.useEffect(() => {
    if (mediaStreamRef.current) {
      attachStreamToVideoRefs(mediaStreamRef.current);
    }
  }, [isVideoOn]);

  // Sync mic track status
  React.useEffect(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn]);

  const { data: booking, isLoading, error, refetch: refetchBooking } = useQuery({
    queryKey: ['booking', bookingReference],
    queryFn: () => api.getBookingByReference(bookingReference || ''),
    enabled: Boolean(bookingReference),
  });

  const { data: rescheduleSlotsData, isLoading: isLoadingRescheduleSlots } = useQuery({
    queryKey: ['reschedule-slots', rescheduleDate, booking?.parent?.timezone],
    queryFn: () => api.getSlots(rescheduleDate, booking?.parent?.timezone || 'America/New_York'),
    enabled: isRescheduleOpen && Boolean(booking?.parent?.timezone),
  });

  const handleConfirmReschedule = async () => {
    if (!bookingReference || !rescheduleDate || !rescheduleTime) return;
    try {
      setIsSubmittingReschedule(true);
      setRescheduleError(null);
      const updated = await api.rescheduleBooking(bookingReference, {
        date: rescheduleDate,
        startTime: rescheduleTime,
        timezone: booking?.parent?.timezone,
      });
      setIsRescheduleOpen(false);
      setRescheduleTime('');
      setRescheduleSuccessMsg(`🎉 Class successfully rescheduled to ${updated.parent.localTimeDisplay}!`);
      await refetchBooking();
      setTimeout(() => setRescheduleSuccessMsg(null), 7000);
    } catch (err: any) {
      console.error('Reschedule error:', err);
      setRescheduleError(err?.message || 'Failed to reschedule. Please select an available slot.');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!bookingReference) return;
    try {
      setIsSubmittingCancel(true);
      await api.cancelBooking(bookingReference);
      setIsCancelOpen(false);
      await refetchBooking();
    } catch (err: any) {
      console.error('Cancel error:', err);
      alert(err?.message || 'Failed to cancel booking.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [
      ...prev,
      { sender: 'You', text: userText, time: timeStr },
    ]);
    setInputMsg('');

    // Mentor automatic response simulation
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let responseText = "Got it! Let me know if you have any questions as we proceed through the lesson!";

      if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('namaste')) {
        responseText = "Hello! Glad to have you in class today! How are you finding the live lesson so far?";
      } else if (lower.includes('hear') || lower.includes('see') || lower.includes('mic') || lower.includes('audio') || lower.includes('camera') || lower.includes('video')) {
        responseText = "Yes! I can hear and see you clearly on video. Audio and webcam feeds are both working great!";
      } else if (lower.includes('doubt') || lower.includes('question') || lower.includes('help') || lower.includes('explain') || lower.includes('what') || lower.includes('how') || lower.includes('why')) {
        responseText = "That's a great question! Let me explain that step-by-step for you. Feel free to raise your hand anytime as well!";
      } else if (lower.includes('thanks') || lower.includes('thank') || lower.includes('awesome') || lower.includes('great') || lower.includes('nice') || lower.includes('good')) {
        responseText = "You're very welcome! Keep up the fantastic effort!";
      } else if (lower.includes('reschedule') || lower.includes('time') || lower.includes('cancel')) {
        responseText = "You can easily reschedule your session using the 'Reschedule' button right above the video controls!";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'Mentor',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <Video className="w-12 h-12 text-coral-500 animate-bounce mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Connecting to Trial Classroom...</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">Reference: {bookingReference}</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-3 max-w-md">
          <h2 className="text-lg font-extrabold text-rose-600">Classroom Connection Error</h2>
          <p className="text-xs text-slate-600">Booking reference "{bookingReference}" was not found.</p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-xl shadow-md">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (booking.status === 'CANCELLED') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 max-w-lg w-full animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <XCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Trial Class Cancelled</h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Booking reference <strong className="font-mono text-slate-900">{booking.bookingReference}</strong> has been cancelled.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Ref:</span>
              <span className="font-mono font-bold text-slate-900">{booking.bookingReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-900">{booking.studentName || booking.parent.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mentor:</span>
              <span className="font-bold text-slate-900">{booking.mentor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-extrabold text-rose-600">CANCELLED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to="/book"
              className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-lg text-center transition-all"
            >
              Book New Trial Class
            </Link>
            <Link
              to="/"
              className="w-full sm:w-1/2 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCallEnded) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 max-w-lg w-full animate-in zoom-in-95 duration-200">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto shadow-lg ${
            isAutoWoundUp ? 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-emerald-500/10' : 'bg-rose-50 border-rose-200 text-rose-600 shadow-rose-500/10'
          }`}>
            {isAutoWoundUp ? <CheckCircle2 className="w-8 h-8" /> : <PhoneOff className="w-8 h-8" />}
          </div>

          <div>
            {isAutoWoundUp ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black uppercase tracking-wider inline-block mb-2">
                ⏱️ 00:30:00 Commencement Time Complete
              </span>
            ) : null}
            <h2 className="text-2xl font-black text-slate-900">
              {isAutoWoundUp ? 'Trial Class Session Concluded' : 'You Hung Up / Left Class'}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {isAutoWoundUp
                ? `Your 30-minute commencement time with Mentor ${booking.mentor.name} has automatically wound up.`
                : `Your 1:1 trial session with Mentor ${booking.mentor.name} has been disconnected.`}
            </p>
          </div>

          {/* Automated Parent Exit Alert Notification Box (Only if left early) */}
          {!isAutoWoundUp && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 text-left space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 font-black text-xs text-amber-800 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce shrink-0" /> Automated Parent Alert Sent
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                📧 <strong>Urgent Alert Dispatched:</strong> Parent <strong>{booking.parent.name}</strong> ({booking.parent.email}) has been notified via Email & SMS that the student exited the 1:1 class session early.
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Ref:</span>
              <span className="font-mono font-bold text-slate-900">{booking.bookingReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-slate-900">{booking.studentName || booking.parent.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Parent:</span>
              <span className="font-bold text-slate-900">{booking.parent.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mentor:</span>
              <span className="font-bold text-slate-900">{booking.mentor.name}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleRejoin}
              className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-lg shadow-coral-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Video className="w-4 h-4" /> Rejoin Class Call
            </button>
            <Link
              to="/"
              className="w-full sm:w-1/2 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Top Header */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl shadow-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-coral-500 to-amber-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Video className="w-5 h-5 text-coral-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="font-extrabold text-slate-900 text-base">Live Trial Classroom</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-coral-50 text-coral-600 border border-coral-200 font-bold">
                {booking.bookingReference}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE DEMO IN SESSION
              </span>
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> PARENT NO-LOGIN ACCESS ACTIVE
              </span>
              {isMentor ? (
                <button
                  type="button"
                  onClick={toggleRoleMode}
                  className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                  title="Mentor Host Access Active (Click to switch view)"
                >
                  <Crown className="w-3 h-3 text-amber-300" /> MENTOR HOST ACCESS ⇆
                </button>
              ) : (
                <span
                  className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 select-none"
                  title="Joined as Student / Parent Participant"
                >
                  <UserCheck className="w-3 h-3 text-coral-500" /> STUDENT PARTICIPANT MODE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Student: <strong className="text-slate-900 font-bold">{booking.studentName || booking.parent.name}</strong> • Parent:{' '}
              <strong className="text-slate-900 font-bold">{booking.parent.name}</strong> • Mentor:{' '}
              <strong className="text-slate-900 font-bold">{booking.mentor.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          {/* 30-Minute Commencement Countdown Timer Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold border border-amber-500/40 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="text-slate-300">Commencement Time:</span>
            <strong className="text-amber-400 font-extrabold">{formatCommencementTime(timeLeftSeconds)}</strong>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-coral-500" />
            <span>Scheduled: <strong className="text-slate-900 font-bold">{booking.parent.localTimeDisplay}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRescheduleOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Reschedule
            </button>
            <button
              onClick={() => setIsCancelOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Mentor Host Access Control Banner */}
      {isMentor && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 text-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Mentor Host Control Active</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Full Session Authority
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Welcome Mentor <strong>{booking.mentor.name}</strong>! You have full host access over student <strong>{booking.studentName || booking.parent.name}</strong>'s demo class.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    sender: `Mentor ${booking.mentor.name}`,
                    text: '👋 Hello! I am your 1:1 mentor. Welcome to your CodeYoung trial class! Let’s build your first interactive project!',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              📢 Broadcast Host Welcome
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`🎉 Trial Session Completed successfully by Mentor ${booking.mentor.name}! Session progress report dispatched to parent (${booking.parent.email}).`);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" /> Complete Class Session
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Success Alert Banner */}
      {rescheduleSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-950 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-extrabold text-emerald-800">
            <span className="text-base">🎉</span>
            <span>{rescheduleSuccessMsg}</span>
          </div>
          <button
            onClick={() => setRescheduleSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Camera Alert Notification Banner */}
      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 text-xs font-extrabold">
            <VideoOff className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
            <span>⚠️ Mentor wants to see you! Please enable your camera permissions to start your 1:1 live trial session.</span>
          </div>
          <button
            onClick={requestCameraAccess}
            className="px-4 py-2 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            📹 Enable Camera Now
          </button>
        </div>
      )}

      {/* Main Video Classroom Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[520px]">
        {/* Primary Video Canvas - 100% Full Demo Class Screen with Draggable Floating User Camera Tile */}
        <div className={`relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-2xl group ${isChatOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>

          {/* Main Video Screen Container - Fixed Height Demo Class Stream (No size shifts) */}
          <div
            ref={videoContainerRef}
            className="relative w-full h-[440px] md:h-[520px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0"
          >
            {/* 100% Full Demo Class Interactive Workspace Canvas (NO External Youtube Video) */}
            <div className="w-full h-full bg-slate-950 flex flex-col justify-between overflow-hidden relative font-mono select-none">
              
              {/* Workspace Top Toolbar */}
              <div className="w-full px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveWorkspaceTab('CODE_EDITOR')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'CODE_EDITOR' && !isSharing
                        ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> Live Python IDE
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab('WHITEBOARD')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'WHITEBOARD' && !isSharing
                        ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" /> Digital Whiteboard
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab('LIVE_VIDEO')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'LIVE_VIDEO' && !isSharing
                        ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Mentor HD Stream
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Clean Non-Overlapping Mentor Badge inside top bar */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-black/60 border border-white/10 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span>Mentor {booking.mentor.name} (Live 1:1)</span>
                  </div>

                  {activeWorkspaceTab === 'CODE_EDITOR' && !isSharing && (
                    <button
                      onClick={handleRunCode}
                      disabled={isExecutingCode}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Play className={`w-3.5 h-3.5 ${isExecutingCode ? 'animate-spin' : ''}`} />
                      <span>{isExecutingCode ? 'Running...' : 'Run Code'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Workspace Content View OR WebRTC Screen Share View */}
              {isSharing ? (
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 right-4 bg-coral-600/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 z-20">
                    <Monitor className="w-4 h-4 animate-pulse text-amber-300" />
                    <span>Live Screen Share (Google Meet / Zoom Mode)</span>
                    <button
                      onClick={toggleScreenShare}
                      className="ml-2 px-2.5 py-1 bg-white text-coral-600 rounded-lg text-[10px] font-black hover:bg-coral-50 transition-colors shadow-sm"
                    >
                      Stop Share
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activeWorkspaceTab === 'CODE_EDITOR' && (
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                      {/* Left Code Editor View */}
                      <div className="flex-1 bg-slate-950 p-4 text-xs font-mono text-emerald-300 overflow-y-auto leading-relaxed border-b md:border-b-0 md:border-r border-slate-800">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-slate-400 font-sans text-[11px]">
                          <span className="flex items-center gap-1.5 text-coral-400 font-bold">
                            <Sparkles className="w-3.5 h-3.5" /> main.py — 1:1 Live Pair Programming Session
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Python 3.11</span>
                        </div>
                        <textarea
                          value={codeContent}
                          onChange={(e) => setCodeContent(e.target.value)}
                          className="w-full h-full min-h-[200px] bg-transparent text-emerald-400 focus:outline-none resize-none font-mono leading-relaxed"
                          spellCheck={false}
                        />
                      </div>

                      {/* Right Live Execution Terminal */}
                      <div className="w-full md:w-72 bg-slate-900/90 p-4 text-[11px] font-mono text-slate-200 overflow-y-auto flex flex-col justify-between border-t md:border-t-0 border-slate-800">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-slate-400 pb-2 border-b border-slate-800 font-sans font-bold">
                            <Terminal className="w-3.5 h-3.5 text-amber-400" /> Interactive Console Output
                          </div>
                          <div className="space-y-1.5">
                            {consoleOutput.map((log, i) => (
                              <p key={i} className={log.includes('Output') ? 'text-amber-300 font-bold' : log.includes('Ready') ? 'text-emerald-400' : 'text-slate-400'}>
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkspaceTab === 'WHITEBOARD' && (
                    <div className="flex-1 bg-slate-900 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 backdrop-blur-md max-w-md space-y-3 z-10">
                        <Palette className="w-10 h-10 text-coral-400 mx-auto animate-bounce" />
                        <h3 className="text-sm font-bold text-white">Digital Teaching Whiteboard Active</h3>
                        <p className="text-xs text-slate-400">
                          Mentor <strong>{booking.mentor.name}</strong> is sharing interactive logic diagrams & flowcharts on screen.
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <span className="w-3 h-3 rounded-full bg-coral-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWorkspaceTab === 'LIVE_VIDEO' && (
                    <div className="flex-1 bg-slate-900 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-coral-500 to-amber-500 p-1 shadow-2xl animate-pulse mb-4">
                        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-2xl font-black text-white">
                          {booking.mentor.name.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <h3 className="text-base font-extrabold text-white">Mentor {booking.mentor.name}</h3>
                      <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1 font-bold">
                        <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> Audio & Video Stream Active
                      </p>
                      {/* Waveform Animation */}
                      <div className="flex items-end gap-1 h-6 mt-4">
                        <span className="w-1 bg-emerald-400 h-3 animate-bounce" />
                        <span className="w-1 bg-emerald-400 h-6 animate-bounce delay-75" />
                        <span className="w-1 bg-emerald-400 h-4 animate-bounce delay-150" />
                        <span className="w-1 bg-emerald-400 h-5 animate-bounce delay-100" />
                        <span className="w-1 bg-emerald-400 h-2 animate-bounce" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Floating Emoji Burst Animations */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
              {floatingReactions.map((r) => (
                <div
                  key={r.id}
                  style={{ left: `${r.x}%` }}
                  className="absolute bottom-16 text-4xl md:text-5xl animate-in fade-in slide-in-from-bottom-8 duration-500 transition-all ease-out"
                >
                  <span className="inline-block animate-bounce drop-shadow-lg">{r.emoji}</span>
                </div>
              ))}
            </div>

            {/* Screen Share Overlay Indicator if sharing */}
            {isSharing && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-coral-500/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce pointer-events-none">
                <Monitor className="w-4 h-4" /> Screen Sharing Active
              </div>
            )}

            {/* FLOATING DRAGGABLE & RESIZABLE USER CAMERA TILE */}
            <div
              onMouseDown={handleTileMouseDown}
              onTouchStart={handleTileTouchStart}
              style={{
                position: 'absolute',
                left: userTilePos ? `${userTilePos.x}px` : undefined,
                right: userTilePos ? undefined : '16px',
                top: userTilePos ? `${userTilePos.y}px` : undefined,
                bottom: userTilePos ? undefined : '16px',
                width: `${userTileSize.width}px`,
                touchAction: 'none',
              }}
              className={`draggable-user-tile z-30 transition-shadow rounded-2xl bg-slate-900/95 backdrop-blur-xl border-2 ${
                isVideoOn ? 'border-emerald-500/80 shadow-emerald-500/20' : 'border-rose-500/80 shadow-rose-500/20'
              } shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing ${
                isDraggingTile ? 'cursor-grabbing ring-4 ring-emerald-500/40 scale-[1.01]' : ''
              } ${isResizingTile ? 'ring-4 ring-amber-500/40' : ''}`}
              title="Drag anywhere to move camera feed. Drag bottom-right corner handle to adjust size."
            >
              {/* Tile Header Bar */}
              <div className="w-full px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 pointer-events-none h-8">
                <div className="flex items-center gap-1.5 min-w-0">
                  <GripVertical className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-white truncate max-w-[130px]">
                    You ({booking.studentName || booking.parent.name})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE CAM
                  </span>
                </div>
              </div>

              {/* Tile Body: Live Webcam Video Feed */}
              <div
                style={{ height: `${userTileSize.height}px` }}
                className="relative w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              >
                {isVideoOn ? (
                  <video
                    ref={mainStudentVideoRef}
                    autoPlay
                    playsInline
                    muted
                    disablePictureInPicture
                    className="w-full h-full object-cover transform -scale-x-100 pointer-events-none"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-3 text-slate-400 space-y-1">
                    <VideoOff className="w-8 h-8 text-rose-500 animate-bounce" />
                    <p className="text-xs font-extrabold text-white">Camera Off</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVideoOn(true);
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-coral-500 to-amber-500 text-white text-[10px] font-extrabold rounded-lg shadow-md active:scale-95 pointer-events-auto"
                    >
                      Turn On Camera
                    </button>
                  </div>
                )}

                {/* Mic Status Indicator Badge */}
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 z-10 pointer-events-none">
                  {isMicOn ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Mic className="w-3 h-3 text-emerald-400" /> Mic Active
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <MicOff className="w-3 h-3 text-rose-400" /> Muted
                    </span>
                  )}
                </div>

                {/* Bottom-Right Corner Resize Handle */}
                <div
                  onMouseDown={handleResizeMouseDown}
                  onTouchStart={handleResizeTouchStart}
                  className="tile-resize-handle absolute bottom-0 right-0 w-6 h-6 z-40 cursor-nwse-resize flex items-center justify-center bg-slate-950/90 border-t border-l border-slate-700 text-amber-400 hover:text-white hover:bg-amber-500 transition-colors rounded-tl-lg shadow-md"
                  title="Drag corner to adjust video tile size"
                >
                  <span className="text-[10px] font-mono leading-none select-none">◢</span>
                </div>
              </div>
            </div>
          </div>

          {/* Single Line Classroom Control Toolbar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-nowrap items-center justify-center gap-2 sm:gap-3 overflow-x-auto max-w-full py-1">
            {/* Mic Toggle */}
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-center gap-1.5 font-bold text-xs shrink-0 whitespace-nowrap ${
                isMicOn
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
              <span>{isMicOn ? 'Mic On' : 'Unmute'}</span>
            </button>

            {/* Camera Toggle */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-center gap-1.5 font-bold text-xs shrink-0 whitespace-nowrap ${
                isVideoOn
                  ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />}
              <span>{isVideoOn ? 'Cam On' : 'Cam Off'}</span>
            </button>

            {/* Hand Raise / Lower Toggle */}
            <button
              onClick={() => setIsHandRaised((prev) => !prev)}
              className={`px-3 py-2.5 sm:py-3 rounded-2xl border transition-all flex items-center justify-center gap-1.5 font-extrabold text-xs shrink-0 whitespace-nowrap ${
                isHandRaised
                  ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              }`}
              title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            >
              <Hand className={`w-4 h-4 sm:w-5 sm:h-5 ${isHandRaised ? 'fill-white text-white' : 'text-amber-400'}`} />
              <span>{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
            </button>

            {/* 5 Reaction Emojis Bar */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner shrink-0 whitespace-nowrap">
              {['👍', '👏', '❤️', '💡', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-base sm:text-lg transition-transform active:scale-125 hover:scale-110"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Real WebRTC Screen Share Toggle (Google Meet / Zoom style) */}
            <button
              onClick={toggleScreenShare}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-center gap-1.5 font-bold text-xs shrink-0 whitespace-nowrap ${
                isSharing
                  ? 'bg-coral-500 border-coral-400 text-white shadow-lg shadow-coral-500/30 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              title="Share Screen (Google Meet & Zoom mode)"
            >
              {isSharing ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
              <span>{isSharing ? 'Stop Share' : 'Share Screen'}</span>
            </button>

            {/* Live Chat Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-center gap-1.5 font-bold text-xs shrink-0 whitespace-nowrap ${
                isChatOpen
                  ? 'bg-coral-500 border-coral-400 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              title="Toggle Live Chat Sidebar"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Chat</span>
            </button>

            {/* Hang Up & Leave Class Call */}
            <button
              onClick={handleHangUp}
              className="px-3.5 py-2.5 sm:py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 border border-rose-500 text-white font-black text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 active:scale-95 shrink-0 whitespace-nowrap"
              title="Hang Up & Leave Class Call"
            >
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
              <span>Hang Up</span>
            </button>
          </div>
        </div>

        {/* Live Chat */}
        {isChatOpen && (
          <div className="rounded-3xl bg-white border-2 border-slate-300 flex flex-col justify-between overflow-hidden shadow-2xl shadow-slate-200/80">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-coral-500" /> Class Live Chat
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">2 Participants</span>
            </div>

            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 max-h-96 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl space-y-1 ${
                    msg.sender === 'You'
                      ? 'bg-coral-500 text-white text-right ml-4 shadow-sm'
                      : msg.sender === 'System'
                      ? 'bg-slate-100 text-slate-600 text-center text-[11px] italic'
                      : 'bg-slate-100 border border-slate-200 text-slate-900 text-left mr-4 shadow-sm'
                  }`}
                >
                  <div className={`flex items-center justify-between text-[10px] font-bold mb-0.5 ${msg.sender === 'You' ? 'text-coral-100' : 'text-slate-500'}`}>
                    <span>{msg.sender}</span>
                    <span className="font-normal opacity-80">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
              <input
                type="text"
                placeholder="Type message to mentor..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-coral-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Locked Full Course Curriculum Classes Section */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Full Course Curriculum Sessions
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Upcoming 1-on-1 deep dive modules available after completing your trial session.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold w-fit">
            <Lock className="w-3.5 h-3.5 text-amber-600" /> Enrolled Students Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              module: 'Module 1: Advanced Logic & Algorithms',
              duration: '45 mins • Live 1:1',
              description: 'Master data structures, recursive logic, and real-world problem-solving.',
              tag: 'Locked Session 02',
              bgImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
            },
            {
              module: 'Module 2: Full-Stack Web Architecture',
              duration: '60 mins • Hands-on Project',
              description: 'Build production APIs, database schemas, and responsive UI components.',
              tag: 'Locked Session 03',
              bgImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
            },
            {
              module: 'Module 3: AI & Neural Network Basics',
              duration: '60 mins • Project Showcase',
              description: 'Train custom ML models, prompt engineering, and intelligent agent flows.',
              tag: 'Locked Session 04',
              bgImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl bg-slate-950 border-2 border-slate-700/80 p-5 overflow-hidden shadow-2xl hover:border-amber-500/80 transition-all flex flex-col justify-between min-h-[220px]"
            >
              {/* Vivid Blurred Background Image with Automatic Fallback */}
              <img
                src={item.bgImage}
                alt={item.module}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop';
                }}
                className="absolute inset-0 w-full h-full object-cover filter blur-[2px] scale-105 opacity-65 pointer-events-none select-none transition-transform group-hover:scale-115 duration-500 z-0"
              />

              {/* Gradient Overlay for High Contrast & Readable Text */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40 z-10 flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/25 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white tracking-wide drop-shadow-md">{item.module}</span>
                <span className="text-[10px] text-amber-200 font-extrabold font-mono bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-400/40 shadow-xs">
                  🔒 Locked • {item.tag}
                </span>
                <p className="text-[11px] text-slate-200 font-semibold max-w-[230px] drop-shadow-sm">
                  Unlocks automatically upon completing your 1:1 trial class!
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                <h3 className="font-extrabold text-slate-900 text-base">Reschedule Trial Class</h3>
              </div>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Select a new date and time slot for booking reference <strong className="text-slate-900">{booking.bookingReference}</strong> ({booking.parent.timezone}).
            </p>

            {rescheduleError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {rescheduleError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Select New Date:</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Select Available Time Slot:</label>
                {isLoadingRescheduleSlots ? (
                  <p className="text-xs text-slate-500 animate-pulse">Loading available slots...</p>
                ) : rescheduleSlotsData?.slots && rescheduleSlotsData.slots.filter(s => s.isAvailable).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                    {rescheduleSlotsData.slots
                      .filter((s) => s.isAvailable)
                      .map((slot) => (
                        <button
                          key={slot.startTimeUtc}
                          type="button"
                          onClick={() => setRescheduleTime(slot.parentTimeStr)}
                          className={`p-2 rounded-xl border text-xs font-extrabold transition-all ${
                            rescheduleTime === slot.parentTimeStr
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {slot.displayTime}
                        </button>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    No open slots on {rescheduleDate}. Please choose another date.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rescheduleTime || isSubmittingReschedule}
                onClick={handleConfirmReschedule}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
              >
                {isSubmittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
              <XCircle className="w-6 h-6" />
              <h3 className="font-black text-slate-900 text-base">Cancel Trial Booking</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to cancel booking <strong className="text-slate-900">{booking.bookingReference}</strong>? This slot will be released back to the mentor pool.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
              >
                {isSubmittingCancel ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
