class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private userInteracted: boolean = false;

    private constructor() {
        this.preloadSounds();
        this.setupInteractionListener();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private setupInteractionListener() {
        const enableAudio = () => {
            this.userInteracted = true;
            // Pre-play all sounds silently to unlock them
            this.sounds.forEach(sound => {
                sound.volume = 0;
                sound.play().then(() => sound.pause()).catch(() => { });
                sound.volume = 0.4;
                sound.currentTime = 0;
            });
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
        };
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
    }

    private preloadSounds() {
        // Using Pixabay CDN - free sound effects
        const soundUrls = {
            startup: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3', // Electric buzz
            lightOn: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1f6c9.mp3', // Light switch
            darkOn: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749bf9e.mp3'   // Power down
        };

        Object.entries(soundUrls).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 0.4;
            audio.crossOrigin = 'anonymous';
            this.sounds.set(key, audio);
        });
    }

    public playStartup() {
        if (!this.userInteracted) return;
        const sound = this.sounds.get('startup');
        if (sound) {
            sound.loop = true;
            sound.volume = 0.25;
            sound.currentTime = 0;
            sound.play().catch(() => { });
        }
    }

    public stopStartup() {
        const sound = this.sounds.get('startup');
        if (sound) {
            const fadeOut = setInterval(() => {
                if (sound.volume > 0.05) {
                    sound.volume -= 0.05;
                } else {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.volume = 0.25;
                    clearInterval(fadeOut);
                }
            }, 80);
        }
    }

    public playThemeSwitch(theme: 'light' | 'dark') {
        const key = theme === 'light' ? 'lightOn' : 'darkOn';
        const sound = this.sounds.get(key);
        if (sound) {
            sound.volume = 0.5;
            sound.currentTime = 0;
            sound.play().catch(() => { });
        }
    }
}

export const soundManager = SoundManager.getInstance();
