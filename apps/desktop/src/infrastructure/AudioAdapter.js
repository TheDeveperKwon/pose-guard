export class AudioAdapter {
    constructor(soundPath) {
        this.audio = new Audio(soundPath);
    }

    play() {
        // Prevent overlapping sounds if it's already playing
        if (this.audio.paused) {
            this.audio.play().catch(error => {
                console.error("Error playing audio:", error);
            });
        }
    }
}
