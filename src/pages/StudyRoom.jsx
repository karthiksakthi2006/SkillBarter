import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, API_URL } from '../utils/api.js';
import { io } from 'socket.io-client';

const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

export default function StudyRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const pendingCandidates = useRef([]);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    let socket;
    async function start() {
      try {
        const data = await api(`/study/rooms/${roomId}`);
        if (!mounted) return;
        setRoom(data.room);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideo.current) localVideo.current.srcObject = stream;

        socket = io(API_URL.replace(/\/api$/, ''), { auth: { token: localStorage.getItem('skillbarter_token') } });
        socketRef.current = socket;
        const pc = new RTCPeerConnection(rtcConfig);
        pcRef.current = pc;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        pc.ontrack = event => { if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0]; };
        pc.onicecandidate = event => { if (event.candidate) socket.emit('webrtc-ice-candidate', { roomId, candidate: event.candidate }); };
        pc.onconnectionstatechange = () => setStatus(pc.connectionState === 'connected' ? 'Connected' : pc.connectionState);

        socket.on('study-peer-ready', async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', { roomId, offer });
        });
        socket.on('webrtc-offer', async offer => {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          for (const candidate of pendingCandidates.current) await pc.addIceCandidate(candidate);
          pendingCandidates.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-answer', { roomId, answer });
        });
        socket.on('webrtc-answer', async answer => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          for (const candidate of pendingCandidates.current) await pc.addIceCandidate(candidate);
          pendingCandidates.current = [];
        });
        socket.on('webrtc-ice-candidate', async candidate => {
          const ice = new RTCIceCandidate(candidate);
          if (pc.remoteDescription) await pc.addIceCandidate(ice);
          else pendingCandidates.current.push(ice);
        });
        socket.on('connect', () => { socket.emit('join-study-room', roomId); setStatus('Waiting for your partner...'); });
      } catch (err) { if (mounted) setError(err.message || 'Could not join the study room.'); }
    }
    start();
    return () => {
      mounted = false;
      socket?.emit('leave-study-room', roomId);
      socket?.disconnect();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId]);

  function toggleMic() {
    const next = !micOn;
    localStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = next; });
    setMicOn(next);
  }
  function toggleCamera() {
    const next = !cameraOn;
    localStreamRef.current?.getVideoTracks().forEach(track => { track.enabled = next; });
    setCameraOn(next);
  }
  async function toggleScreenShare() {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      if (!sharing) {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(screen.getVideoTracks()[0]);
        screenStreamRef.current = screen;
        screen.getVideoTracks()[0].onended = () => stopScreenShare();
        setSharing(true);
      } else stopScreenShare();
    } catch (err) { setError(err.message || 'Screen sharing was cancelled.'); }
  }
  async function stopScreenShare() {
    const pc = pcRef.current;
    const camera = localStreamRef.current?.getVideoTracks()[0];
    const sender = pc?.getSenders().find(s => s.track?.kind === 'video');
    if (sender && camera) await sender.replaceTrack(camera);
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    setSharing(false);
  }
  function leave() { navigate('/study'); }

  if (error) return <div className="page"><div className="card empty-state"><h2>Could not open study room</h2><p>{error}</p><button className="btn btn--primary" onClick={() => navigate('/study')}>Back to Study</button></div></div>;
  if (!room) return <div className="page"><p>Opening study room...</p></div>;

  return <div className="study-room-page">
    <header className="study-room-header"><div><p className="dashboard-eyebrow">LIVE STUDY SESSION</p><h1>{room.topic}</h1><span>Learning with {room.other.displayName} · {status}</span></div><button className="btn" onClick={leave}>Leave room</button></header>
    <div className="study-video-grid">
      <div className="video-tile"><video ref={localVideo} autoPlay muted playsInline/><div className="video-label">You</div></div>
      <div className="video-tile"><video ref={remoteVideo} autoPlay playsInline/><div className="video-label">{room.other.displayName}</div>{status !== 'Connected' && <div className="video-waiting">Waiting for your partner to join…</div>}</div>
    </div>
    <div className="study-controls"><button onClick={toggleMic}>{micOn ? '🎙️ Mute' : '🔇 Unmute'}</button><button onClick={toggleCamera}>{cameraOn ? '📷 Camera off' : '📹 Camera on'}</button><button onClick={toggleScreenShare}>{sharing ? '🛑 Stop sharing' : '🖥️ Share screen'}</button><button className="leave-btn" onClick={leave}>Leave</button></div>
    <p className="study-safety-note">Only connected SkillBarter friends can enter this room. No recording is built in. Leave the room anytime if you are uncomfortable.</p>
  </div>;
}
