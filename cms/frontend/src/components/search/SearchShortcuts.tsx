import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Image, Work, Chat, Calendar } from 'react-iconly';

/**
 * Composant affichant des raccourcis de recherche prédéfinis
 */
const SearchShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useSearch();

  const shortcuts = [
    { 
      label: 'Projets récents', 
      icon: Work, 
      action: () => {
        search('', { 
          type: 'project', 
          sortBy: 'date', 
          sortOrder: 'desc',
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
          }
        });
        navigate('/search');
      }
    },
    { 
      label: 'Médias récents', 
      icon: Image, 
      action: () => {
        search('', { 
          type: 'media', 
          sortBy: 'date', 
          sortOrder: 'desc',
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
          }
        });
        navigate('/search');
      }
    },
    { 
      label: 'Témoignages publiés', 
      icon: Chat, 
      action: () => {
        search('', { 
          type: 'testimonial', 
          status: 'published'
        });
        navigate('/search');
      }
    },
    { 
      label: 'Contenu de cette année', 
      icon: Calendar, 
      action: () => {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        search('', { 
          dateRange: {
            start: startOfYear
          }
        });
        navigate('/search');
      }
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Search set="light" className="mr-2" />
          Raccourcis de recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {shortcuts.map((shortcut, index) => {
          const Icon = shortcut.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto py-2 px-3"
              onClick={shortcut.action}
            >
              <Icon set="light" size="small" className="mr-2" />
              <span className="text-xs">{shortcut.label}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SearchShortcuts;