export class CameraAdapter {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.stream = null;
    }

    async start() {
        try {
            // Ensure previous stream state is fully cleared before restart.
            this.stop();
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: false
            });
            this.videoElement.srcObject = this.stream;
            return new Promise((resolve, reject) => {
                const playVideo = () => {
                    Promise.resolve(this.videoElement.play())
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                };

                if (this.videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
                    playVideo();
                    return;
                }

                const onLoaded = () => {
                    this.videoElement.removeEventListener('loadedmetadata', onLoaded);
                    playVideo();
                };
                this.videoElement.addEventListener('loadedmetadata', onLoaded, { once: true });
            });
        } catch (error) {
            console.error('Error accessing webcam:', error);
            throw error;
        }
    }

    stop() {
        this.videoElement.onloadedmetadata = null;
        this.videoElement.pause();
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
        }
        this.stream = null;
        this.videoElement.srcObject = null;
    }
}
