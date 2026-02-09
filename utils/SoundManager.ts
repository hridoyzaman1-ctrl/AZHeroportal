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
            this.unlockAudio();
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
        };
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
    }

    public unlockAudio() {
        if (this.userInteracted) return;
        this.userInteracted = true;

        // Pre-play all sounds silently to unlock them in browser memory
        this.sounds.forEach(sound => {
            const originalVolume = sound.volume;
            sound.volume = 0;
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = originalVolume;
            }).catch(() => { });
        });

        // If startup should be playing, start it now
        if (this.shouldBePlayingStartup) {
            this.playStartup();
        }
    }

    private shouldBePlayingStartup: boolean = false;

    private preloadSounds() {
        const soundUrls = {
            startup: '/sounds/startup.mp3',
            lightOn: '/sounds/light.mp3',
            darkOn: '/sounds/dark.mp3'
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
        this.shouldBePlayingStartup = true;
        if (!this.userInteracted) return;

        const sound = this.sounds.get('startup');
        if (sound) {
            sound.loop = true;
            sound.volume = 0;
            sound.play().then(() => {
                // Fade in
                let vol = 0;
                const fadeIn = setInterval(() => {
                    if (vol < 0.25) {
                        vol += 0.02;
                        sound.volume = vol;
                    } else {
                        clearInterval(fadeIn);
                    }
                }, 50);
            }).catch(() => { });
        }
    }

    public stopStartup() {
        this.shouldBePlayingStartup = false;
        const sound = this.sounds.get('startup');
        if (sound) {
            const fadeOut = setInterval(() => {
                if (sound.volume > 0.02) {
                    sound.volume -= 0.02;
                } else {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.volume = 0.4;
                    clearInterval(fadeOut);
                }
            }, 50);
        }
    }

    public playThemeSwitch(theme: 'light' | 'dark') {
        const key = theme === 'light' ? 'lightOn' : 'darkOn';
        const sound = this.sounds.get(key);
        if (sound) {
            sound.volume = 0.5;
            sound.currentTime = 0;
            sound.play().catch(() => {
                // If blocked, unlock first then play
                if (!this.userInteracted) {
                    this.unlockAudio();
                    setTimeout(() => sound.play().catch(() => { }), 100);
                }
            });
        }
    }
}

export const soundManager = SoundManager.getInstance();
