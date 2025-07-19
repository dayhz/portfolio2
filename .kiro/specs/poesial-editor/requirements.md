# Requirements Document - Éditeur Style Poesial

## Introduction

Créer un éditeur Tiptap qui reproduit exactement les layouts et rendus du site Poesial, permettant aux utilisateurs de créer du contenu avec les mêmes styles et structures visuelles que le site de référence.

## Requirements

### Requirement 1 - Layouts d'Images

**User Story:** En tant qu'utilisateur, je veux pouvoir ajouter des images avec différents layouts comme sur le site Poesial, afin de créer un contenu visuellement riche et professionnel.

#### Acceptance Criteria

1. WHEN l'utilisateur clique sur "Image" THEN le système SHALL afficher un menu de choix de layouts
2. WHEN l'utilisateur sélectionne "Image pleine largeur" THEN le système SHALL créer une section avec `data-wf--template-section-image--variant="auto"`
3. WHEN l'utilisateur sélectionne "Image 16:9" THEN le système SHALL créer une section avec `data-wf--template-section-image--variant="16-9"`
4. WHEN l'utilisateur sélectionne "Images en grille" THEN le système SHALL créer une grille avec `temp-comp-img_grid`
5. WHEN l'utilisateur upload une image THEN le système SHALL l'encapsuler dans la structure HTML exacte du site Poesial

### Requirement 2 - Blocs de Texte Riches

**User Story:** En tant qu'utilisateur, je veux pouvoir créer des blocs de texte avec les styles du site Poesial, afin que mon contenu ait la même apparence que le site de référence.

#### Acceptance Criteria

1. WHEN l'utilisateur tape du texte THEN le système SHALL l'encapsuler dans `temp-rich u-color-dark w-richtext`
2. WHEN l'utilisateur crée un titre H2 THEN le système SHALL appliquer les styles Poesial
3. WHEN l'utilisateur crée un paragraphe THEN le système SHALL maintenir l'espacement et la typographie du site
4. WHEN l'utilisateur crée une citation THEN le système SHALL utiliser la structure `temp-comp-testimony`

### Requirement 3 - Blocs de Contenu Spécialisés

**User Story:** En tant qu'utilisateur, je veux pouvoir ajouter des blocs spécialisés comme les témoignages et les grilles d'informations, afin de reproduire tous les éléments du site Poesial.

#### Acceptance Criteria

1. WHEN l'utilisateur sélectionne "Témoignage" THEN le système SHALL créer la structure `temp-comp-testimony` complète
2. WHEN l'utilisateur sélectionne "Bloc de texte simple" THEN le système SHALL créer `temp-comp-text`
3. WHEN l'utilisateur ajoute des informations projet THEN le système SHALL utiliser `temp-about_container`
4. WHEN l'utilisateur ajoute une vidéo THEN le système SHALL l'encapsuler dans `video-wrp`

### Requirement 4 - Espacement et Sections

**User Story:** En tant qu'utilisateur, je veux que l'espacement entre les éléments soit identique au site Poesial, afin d'avoir un rendu final parfaitement cohérent.

#### Acceptance Criteria

1. WHEN l'utilisateur ajoute du contenu THEN le système SHALL ajouter automatiquement les espacements `g_section_space`
2. WHEN l'utilisateur crée une section THEN le système SHALL utiliser les conteneurs `u-container`
3. WHEN l'utilisateur organise le contenu THEN le système SHALL maintenir la hiérarchie des sections du site
4. WHEN l'utilisateur prévisualise THEN le rendu SHALL être identique au site Poesial

### Requirement 5 - Interface Utilisateur Intuitive

**User Story:** En tant qu'utilisateur, je veux une interface simple pour choisir les différents layouts, afin de créer du contenu rapidement sans connaître le code HTML.

#### Acceptance Criteria

1. WHEN l'utilisateur ouvre l'éditeur THEN le système SHALL afficher des boutons visuels pour chaque type de contenu
2. WHEN l'utilisateur survole un bouton THEN le système SHALL afficher un aperçu du layout
3. WHEN l'utilisateur sélectionne un layout THEN le système SHALL insérer le bloc correspondant
4. WHEN l'utilisateur édite le contenu THEN le système SHALL maintenir la structure HTML sous-jacente
5. WHEN l'utilisateur exporte THEN le système SHALL générer le HTML exact compatible avec le site Poesial