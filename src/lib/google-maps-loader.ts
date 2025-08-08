import { Loader } from '@googlemaps/js-api-loader';

// Singleton pattern for Google Maps loader
class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loader: Loader | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public async load(): Promise<void> {
    // If already loaded, return immediately
    if (this.isLoaded) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      throw new Error('Google Maps API key not configured');
    }

    this.isLoading = true;

    // Create loader only once with all required libraries
    if (!this.loader) {
      this.loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places', 'visualization'], // Always include all libraries we might need
        region: 'CO',
        language: 'es'
      });
    }

    this.loadPromise = this.loader.load().then(() => {
      this.isLoaded = true;
      this.isLoading = false;
      console.log('Google Maps API loaded successfully');
    }).catch((error) => {
      this.isLoading = false;
      console.error('Error loading Google Maps API:', error);
      throw error;
    });

    return this.loadPromise;
  }

  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  public getLoader(): Loader | null {
    return this.loader;
  }
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();
