# Requirements Document - Portfolio CMS

## Introduction

Ce projet vise à créer un système de gestion de contenu (CMS) sur mesure pour le portfolio de Victor Berbel. Le CMS permettra de gérer facilement tout le contenu du site sans avoir à modifier le code HTML directement. L'objectif est de fournir une interface intuitive pour mettre à jour les textes, images, vidéos, projets, témoignages et autres éléments du portfolio.

## Requirements

### Requirement 1 - Authentification et Sécurité

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir me connecter de manière sécurisée au CMS pour gérer mon contenu.

#### Acceptance Criteria

1. WHEN l'utilisateur accède à `/admin` THEN le système SHALL afficher une page de connexion
2. WHEN l'utilisateur saisit des identifiants valides THEN le système SHALL l'authentifier et rediriger vers le dashboard
3. WHEN l'utilisateur saisit des identifiants invalides THEN le système SHALL afficher un message d'erreur
4. WHEN l'utilisateur est inactif pendant 2 heures THEN le système SHALL automatiquement le déconnecter
5. WHEN l'utilisateur accède à une page admin sans être connecté THEN le système SHALL le rediriger vers la page de connexion

### Requirement 2 - Dashboard Principal

**User Story:** En tant qu'administrateur, je veux avoir un dashboard central pour naviguer facilement entre les différentes sections de contenu.

#### Acceptance Criteria

1. WHEN l'utilisateur se connecte THEN le système SHALL afficher un dashboard avec des statistiques générales
2. WHEN l'utilisateur consulte le dashboard THEN le système SHALL afficher le nombre de projets, témoignages et dernières modifications
3. WHEN l'utilisateur clique sur une section THEN le système SHALL naviguer vers la page de gestion correspondante
4. WHEN l'utilisateur consulte le dashboard THEN le système SHALL afficher des raccourcis vers les actions fréquentes

### Requirement 3 - Gestion des Informations Personnelles

**User Story:** En tant qu'administrateur, je veux pouvoir modifier mes informations personnelles (nom, titre, description, photo) facilement.

#### Acceptance Criteria

1. WHEN l'utilisateur accède à la section "Profil" THEN le système SHALL afficher un formulaire avec les informations actuelles
2. WHEN l'utilisateur modifie le nom ou titre THEN le système SHALL mettre à jour ces informations sur toutes les pages
3. WHEN l'utilisateur upload une nouvelle photo THEN le système SHALL la redimensionner automatiquement et remplacer l'ancienne
4. WHEN l'utilisateur modifie la description principale THEN le système SHALL mettre à jour le texte sur la page d'accueil
5. WHEN l'utilisateur sauvegarde les modifications THEN le système SHALL confirmer la mise à jour avec un message de succès

### Requirement 4 - Gestion des Projets Portfolio

**User Story:** En tant qu'administrateur, je veux pouvoir ajouter, modifier et supprimer des projets de mon portfolio avec leurs images et détails.

#### Acceptance Criteria

1. WHEN l'utilisateur accède à la section "Projets" THEN le système SHALL afficher la liste de tous les projets existants
2. WHEN l'utilisateur clique sur "Ajouter un projet" THEN le système SHALL afficher un formulaire de création
3. WHEN l'utilisateur crée un projet THEN le système SHALL permettre de définir : titre, description, catégorie, images, liens, année, client
4. WHEN l'utilisateur upload des images THEN le système SHALL les optimiser automatiquement pour le web
5. WHEN l'utilisateur définit une catégorie THEN le système SHALL permettre de choisir entre "website", "product", "mobile"
6. WHEN l'utilisateur publie un projet THEN le système SHALL l'afficher automatiquement sur les pages work.html et index.html
7. WHEN l'utilisateur supprime un projet THEN le système SHALL demander confirmation avant suppression définitive
8. WHEN l'utilisateur réorganise les projets THEN le système SHALL permettre de changer l'ordre d'affichage par drag & drop

### Requirement 5 - Gestion des Témoignages Clients

**User Story:** En tant qu'administrateur, je veux pouvoir gérer les témoignages clients avec leurs photos et informations.

#### Acceptance Criteria

1. WHEN l'utilisateur accède à la section "Témoignages" THEN le système SHALL afficher tous les témoignages existants
2. WHEN l'utilisateur ajoute un témoignage THEN le système SHALL permettre de saisir : citation, nom client, poste, entreprise, photo client, image projet
3. WHEN l'utilisateur upload une photo client THEN le système SHALL la recadrer automatiquement en format carré
4. WHEN l'utilisateur active un témoignage THEN le système SHALL l'inclure dans le slider des pages
5. WHEN l'utilisateur désactive un témoignage THEN le système SHALL le retirer du slider sans le supprimer
6. WHEN l'utilisateur réorganise les témoignages THEN le système SHALL permettre de définir l'ordre d'apparition dans le slider

### Requirement 6 - Gestion des Services

**User Story:** En tant qu'administrateur, je veux pouvoir modifier les descriptions de mes services et processus de travail.

#### Acceptance Criteria

1. WHEN l'utilisateur accède à la section "Services" THEN le système SHALL afficher les 3 services actuels (Website, Product, Mobile)
2. WHEN l'utilisateur modifie une description de service THEN le système SHALL mettre à jour le contenu sur services.html et index.html
3. WHEN l'utilisateur modifie le processus de travail THEN le système SHALL mettre à jour les 4 étapes (Discovery, Wireframe, Mood Board, Design)
4. WHEN l'utilisateur modifie les compétences THEN le système SHALL mettre à jour la liste des expertises affichées
5. WHEN l'utilisateur change une vidéo de démonstration THEN le système SHALL remplacer le fichier et mettre à jour les références

### Requirement 7 - Gestion des Médias

**User Story:** En tant qu'administrateur, je veux pouvoir gérer facilement tous les médias (images, vidéos) utilisés sur le site.

#### Acceptance Criteria

1. WHEN l'utilisateur accède à la médiathèque THEN le système SHALL afficher tous les fichiers organisés par type
2. WHEN l'utilisateur upload un fichier THEN le système SHALL l'optimiser automatiquement selon son usage
3. WHEN l'utilisateur supprime un média THEN le système SHALL vérifier s'il est utilisé et alerter en cas de conflit
4. WHEN l'utilisateur recherche un média THEN le système SHALL permettre de filtrer par nom, type ou date
5. WHEN l'utilisateur remplace un média THEN le système SHALL mettre à jour automatiquement toutes les références

### Requirement 8 - Gestion de la Page À Propos

**User Story:** En tant qu'administrateur, je veux pouvoir mettre à jour ma biographie, statistiques et récompenses.

#### Acceptance Criteria

1. WHEN l'utilisateur accède à la section "À Propos" THEN le système SHALL afficher un éditeur pour la biographie
2. WHEN l'utilisateur modifie les statistiques THEN le système SHALL permettre de changer les chiffres (années d'expérience, projets, etc.)
3. WHEN l'utilisateur ajoute une récompense THEN le système SHALL permettre de saisir : nom, description, lien, date
4. WHEN l'utilisateur gère les photos personnelles THEN le système SHALL permettre d'ajouter/supprimer des images du carousel
5. WHEN l'utilisateur met à jour les liens sociaux THEN le système SHALL vérifier la validité des URLs

### Requirement 9 - Prévisualisation et Publication

**User Story:** En tant qu'administrateur, je veux pouvoir prévisualiser mes modifications avant de les publier sur le site live.

#### Acceptance Criteria

1. WHEN l'utilisateur fait des modifications THEN le système SHALL les sauvegarder en mode brouillon
2. WHEN l'utilisateur clique sur "Prévisualiser" THEN le système SHALL afficher le site avec les modifications en cours
3. WHEN l'utilisateur est satisfait des modifications THEN le système SHALL permettre de publier en un clic
4. WHEN l'utilisateur publie des modifications THEN le système SHALL mettre à jour les fichiers HTML statiques
5. WHEN une erreur survient lors de la publication THEN le système SHALL conserver la version précédente et alerter l'utilisateur

### Requirement 10 - Sauvegarde et Historique

**User Story:** En tant qu'administrateur, je veux pouvoir revenir à une version précédente de mon contenu en cas de problème.

#### Acceptance Criteria

1. WHEN l'utilisateur publie des modifications THEN le système SHALL créer automatiquement une sauvegarde
2. WHEN l'utilisateur consulte l'historique THEN le système SHALL afficher les 10 dernières versions avec dates et descriptions
3. WHEN l'utilisateur veut restaurer une version THEN le système SHALL demander confirmation avant restauration
4. WHEN l'utilisateur restaure une version THEN le système SHALL mettre à jour tout le contenu concerné
5. WHEN le système atteint la limite de sauvegardes THEN il SHALL supprimer automatiquement les plus anciennes

### Requirement 11 - Interface Responsive et Intuitive

**User Story:** En tant qu'administrateur, je veux pouvoir utiliser le CMS facilement depuis n'importe quel appareil.

#### Acceptance Criteria

1. WHEN l'utilisateur accède au CMS depuis un mobile THEN l'interface SHALL s'adapter automatiquement
2. WHEN l'utilisateur utilise le CMS THEN l'interface SHALL être intuitive avec des icônes claires
3. WHEN l'utilisateur fait une action THEN le système SHALL fournir un feedback visuel immédiat
4. WHEN l'utilisateur fait une erreur THEN le système SHALL afficher des messages d'erreur explicites
5. WHEN l'utilisateur navigue dans le CMS THEN le système SHALL maintenir un état cohérent

### Requirement 12 - Performance et SEO

**User Story:** En tant qu'administrateur, je veux que les modifications n'impactent pas négativement les performances et le SEO du site.

#### Acceptance Criteria

1. WHEN l'utilisateur publie des modifications THEN le système SHALL maintenir les balises meta existantes
2. WHEN l'utilisateur ajoute des images THEN le système SHALL générer automatiquement les attributs alt et les formats responsive
3. WHEN l'utilisateur modifie du contenu THEN le système SHALL préserver la structure HTML optimisée pour le SEO
4. WHEN le site est mis à jour THEN le système SHALL maintenir les temps de chargement actuels
5. WHEN l'utilisateur ajoute du contenu THEN le système SHALL vérifier la compatibilité avec les animations existantes