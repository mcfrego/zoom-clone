const socket = io('/')
const peer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const peers = {}
const videoGrid = document.getElementById('video-grid')
const video = document.createElement('video')
video.muted = true

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream (video, stream)

  peer.on('call', call => {
    call.answer(stream)
    const vid = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(vid, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectedToNewUser(userId, stream)
  })  
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})


function connectedToNewUser(userId, stream) {
  const call = peer.call(userId, stream)
  const newUserVideo = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(newUserVideo, userVideoStream)
  })
  call.on('close', () => {
    newUserVideo.remove()
  })

  peers[userId] = call
}

function addVideoStream (vid, strm) {
  vid.srcObject = strm
  vid.addEventListener('loadedmetadata', () => {
    vid.play()
  })
  videoGrid.append(vid)
}

