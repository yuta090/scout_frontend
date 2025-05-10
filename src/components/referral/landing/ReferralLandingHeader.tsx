import React from 'react';
import { Download } from 'lucide-react';

interface ReferralSettings {
  id: number;
  title: string;
  description: string;
  hero_images: string[];
  document_urls: string[];
  form_title: string;
  form_description: string;
  default_agency_id: string | null;
}

interface ReferralLandingHeaderProps {
  settings: ReferralSettings;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}

const ReferralLandingHeader: React.FC<ReferralLandingHeaderProps> = ({ 
  settings, 
  currentImageIndex, 
  setCurrentImageIndex 
}) => {
  return (
    <div 
      className="bg-indigo-600 text-white py-16 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: settings.hero_images && settings.hero_images.length > 0 
          ? `linear-gradient(rgba(79, 70, 229, 0.8), rgba(67, 56, 202, 0.8)), url(${settings.hero_images[currentImageIndex]})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease-in-out'
      }}
    >
      {/* 画像インジケーター（複数画像がある場合のみ表示） */}
      {settings.hero_images && settings.hero_images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {settings.hero_images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`画像 ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            {settings.title}
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl whitespace-pre-line">
            {settings.description}
          </p>
          {settings.document_urls && settings.document_urls.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {settings.document_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  資料をダウンロード {settings.document_urls.length > 1 ? `#${index + 1}` : ''}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralLandingHeader;