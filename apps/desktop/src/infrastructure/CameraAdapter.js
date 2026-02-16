export class CameraAdapter {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.stream = null;
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: false
            });
            this.videoElement.srcObject = this.stream;
            return new Promise((resolve, reject) => {
                this.videoElement.onloadedmetadata = () => {
                    Promise.resolve(this.videoElement.play())
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                };
            });
        } catch (error) {
            console.error('Error accessing webcam:', error);
            throw error;
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
    }
}
