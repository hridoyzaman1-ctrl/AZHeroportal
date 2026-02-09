class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement> = new Map();

    private constructor() {
        this.preloadSounds();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private preloadSounds() {
        const soundUrls = {
            startup: 'https://actions.google.com/sounds/v1/science_fiction/hum_electric_neon_light.ogg',
            lightOn: 'https://actions.google.com/sounds/v1/science_fiction/robotic_movement_short.ogg',
            darkOn: 'https://actions.google.com/sounds/v1/science_fiction/mechanism_lock_release.ogg'
        };

        Object.entries(soundUrls).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 0.4;
            this.sounds.set(key, audio);
        });
    }

    public playStartup() {
        const sound = this.sounds.get('startup');
        if (sound) {
            sound.loop = true;
            sound.volume = 0.3;
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
                    sound.volume = 0.3;
                    clearInterval(fadeOut);
                }
            }, 100);
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
