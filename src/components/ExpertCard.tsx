// src/components/ExpertCard.tsx
import { UNESCOExpert } from '../services/unescoExpertService';

const ExpertCard = ({ expert }: { expert: UNESCOExpert }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-4">
      {expert.imageUrl && (
        <div className="w-20 h-20 flex-shrink-0">
          <img 
            src={expert.imageUrl} 
            alt={expert.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-lg">{expert.name}</h4>
            <p className="text-sm text-gray-600">{expert.title}</p>
          </div>
          {expert.linkedin && (
            <a 
              href={expert.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>{expert.languages.join(', ')}</span>
          </div>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{expert.regions.join(', ')}</span>
          </div>
        </div>

        <div className="mt-3">
          <h5 className="text-sm font-medium mb-1">Areas of Expertise:</h5>
          <div className="flex flex-wrap gap-1">
            {expert.expertise.slice(0, 5).map((area) => (
              <span 
                key={area} 
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <a
          href={`https://www.unesco.org/ethics-ai/en/ai-ethics-experts-without-borders/profile/${expert.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
        >
          View Full Profile →
        </a>
      </div>
    </div>
  </div>
);

export default ExpertCard;