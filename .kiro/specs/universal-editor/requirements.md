# Requirements Document - Éditeur Universel Portfolio

## Introduction

Créer un éditeur Tiptap flexible et universel qui permet de créer n'importe quel type de layout de portfolio (comme Poesial, Zesty, Ordine, Nobe, etc.) avec une interface WYSIWYG intuitive. L'éditeur doit donner la liberté créative totale tout en générant du contenu compatible avec le système de templates du site.

## Requirements

### Requirement 1 - Blocs de Contenu Flexibles

**User Story:** En tant qu'utilisateur, je veux pouvoir ajouter différents types de blocs de contenu, afin de créer des layouts variés comme dans tous les projets du portfolio.

#### Acceptance Criteria

1. WHEN l'utilisateur tape "/" THEN le système SHALL afficher un menu de blocs disponibles
2. WHEN l'utilisateur sélectionne "Image" THEN le système SHALL proposer différentes tailles (pleine largeur, 16:9, auto)
3. WHEN l'utilisateur sélectionne "Grille d'images" THEN le système SHALL créer une grille 2 colonnes
4. WHEN l'utilisateur sélectionne "Texte riche" THEN le système SHALL créer un bloc de texte formaté
5. WHEN l'utilisateur sélectionne "Témoignage" THEN le système SHALL créer un bloc citation avec profil

### Requirement 2 - Interface de Sélection Visuelle

**User Story:** En tant qu'utilisateur, je veux voir visuellement à quoi ressemble chaque type de bloc avant de le sélectionner, afin de choisir rapidement le bon layout.

#### Acceptance Criteria

1. WHEN l'utilisateur ouvre le menu de blocs THEN le système SHALL afficher des aperçus visuels
2. WHEN l'utilisateur survole un bloc THEN le système SHALL montrer un aperçu plus détaillé
3. WHEN l'utilisateur clique sur un bloc THEN le système SHALL l'insérer à la position du curseur
4. WHEN l'utilisateur utilise les flèches clavier THEN le système SHALL naviguer dans le menu
5. WHEN l'utilisateur appuie sur Échap THEN le système SHALL fermer le menu

### Requirement 3 - Édition en Place (WYSIWYG)

**User Story:** En tant qu'utilisateur, je veux pouvoir éditer le contenu directement dans l'éditeur avec le rendu final, afin de voir exactement ce que j'obtiens.

#### Acceptance Criteria

1. WHEN l'utilisateur clique sur du texte THEN le système SHALL permettre l'édition en place
2. WHEN l'utilisateur clique sur une image THEN le système SHALL afficher les contrôles d'édition
3. WHEN l'utilisateur modifie le contenu THEN le système SHALL mettre à jour le rendu en temps réel
4. WHEN l'utilisateur utilise les raccourcis clavier THEN le système SHALL appliquer le formatage
5. WHEN l'utilisateur glisse-dépose une image THEN le système SHALL l'insérer automatiquement

### Requirement 4 - Gestion des Médias

**User Story:** En tant qu'utilisateur, je veux pouvoir ajouter facilement des images et vidéos avec différents layouts, afin de créer des présentations visuelles riches.

#### Acceptance Criteria

1. WHEN l'utilisateur upload une image THEN le système SHALL la redimensionner automatiquement
2. WHEN l'utilisateur sélectionne une taille d'image THEN le système SHALL appliquer les styles appropriés
3. WHEN l'utilisateur ajoute une vidéo THEN le système SHALL l'encapsuler avec les contrôles
4. WHEN l'utilisateur crée une grille THEN le système SHALL permettre d'ajouter/supprimer des éléments
5. WHEN l'utilisateur réorganise les médias THEN le système SHALL sauvegarder la nouvelle disposition

### Requirement 5 - Styles et Rendu Fidèle

**User Story:** En tant qu'utilisateur, je veux que l'éditeur affiche exactement le même rendu que le site final, afin d'avoir une prévisualisation parfaite.

#### Acceptance Criteria

1. WHEN l'utilisateur édite du contenu THEN le système SHALL utiliser les styles exacts du site
2. WHEN l'utilisateur ajoute un bloc THEN le système SHALL appliquer les classes CSS appropriées
3. WHEN l'utilisateur prévisualise THEN le rendu SHALL être identique au site final
4. WHEN l'utilisateur change de taille d'écran THEN le système SHALL adapter le rendu (responsive)
5. WHEN l'utilisateur exporte THEN le HTML généré SHALL être compatible avec le site

### Requirement 6 - Sauvegarde et Export

**User Story:** En tant qu'utilisateur, je veux pouvoir sauvegarder mon travail et l'exporter pour l'intégrer au site, afin de publier mes projets.

#### Acceptance Criteria

1. WHEN l'utilisateur modifie le contenu THEN le système SHALL sauvegarder automatiquement
2. WHEN l'utilisateur clique sur "Sauvegarder" THEN le système SHALL persister les données
3. WHEN l'utilisateur exporte THEN le système SHALL générer le HTML/JSON approprié
4. WHEN l'utilisateur recharge la page THEN le système SHALL restaurer le contenu
5. WHEN l'utilisateur publie THEN le contenu SHALL s'intégrer parfaitement au site

### Requirement 7 - Performance et Expérience Utilisateur

**User Story:** En tant qu'utilisateur, je veux un éditeur rapide et fluide, afin de créer du contenu efficacement sans interruption.

#### Acceptance Criteria

1. WHEN l'utilisateur tape du texte THEN le système SHALL répondre instantanément
2. WHEN l'utilisateur upload des images THEN le système SHALL afficher une barre de progression
3. WHEN l'utilisateur navigue dans l'éditeur THEN les transitions SHALL être fluides
4. WHEN l'utilisateur utilise l'éditeur longtemps THEN les performances SHALL rester stables
5. WHEN l'utilisateur fait une erreur THEN le système SHALL permettre d'annuler (Ctrl+Z)