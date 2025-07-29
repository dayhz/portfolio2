# Requirements Document - Homepage CMS

## Introduction

Ce système CMS permettra de gérer dynamiquement tout le contenu de la homepage du portfolio, incluant toutes les sections identifiées : Hero, Brands/Clients, Portfolio, Services, Offre/Engagement, Témoignages, et Footer. L'objectif est de permettre une gestion facile et intuitive du contenu sans avoir besoin de modifier le code HTML.

## Requirements

### Requirement 1 - Gestion de la section Hero

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir modifier le titre principal, la description et les informations de contact de la section hero, afin de personnaliser ma présentation sans toucher au code.

#### Acceptance Criteria

1. WHEN l'administrateur accède à l'interface CMS THEN le système SHALL afficher un formulaire pour éditer la section Hero
2. WHEN l'administrateur modifie le titre principal THEN le système SHALL sauvegarder et afficher le nouveau titre sur la homepage
3. WHEN l'administrateur modifie la description THEN le système SHALL sauvegarder et afficher la nouvelle description sur la homepage
4. WHEN l'administrateur sauvegarde les modifications THEN le système SHALL mettre à jour la homepage en temps réel

### Requirement 2 - Gestion des logos clients/brands

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir ajouter, supprimer et réorganiser les logos de mes clients dans la section brands, afin de maintenir ma liste de clients à jour.

#### Acceptance Criteria

1. WHEN l'administrateur accède à la gestion des clients THEN le système SHALL afficher la liste actuelle des logos clients
2. WHEN l'administrateur ajoute un nouveau logo THEN le système SHALL permettre l'upload d'image et la saisie du nom du client
3. WHEN l'administrateur supprime un logo THEN le système SHALL retirer le logo de la homepage après confirmation
4. WHEN l'administrateur réorganise les logos THEN le système SHALL permettre le drag & drop et sauvegarder l'ordre
5. WHEN les modifications sont sauvegardées THEN le système SHALL mettre à jour le carrousel de logos sur la homepage

### Requirement 3 - Gestion des projets portfolio

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir ajouter, modifier et supprimer les projets affichés dans la section portfolio, afin de présenter mes travaux les plus récents et pertinents.

#### Acceptance Criteria

1. WHEN l'administrateur accède à la gestion des projets THEN le système SHALL afficher la liste des projets actuels
2. WHEN l'administrateur ajoute un nouveau projet THEN le système SHALL permettre la saisie du titre, description, image et lien
3. WHEN l'administrateur modifie un projet existant THEN le système SHALL pré-remplir le formulaire avec les données actuelles
4. WHEN l'administrateur supprime un projet THEN le système SHALL retirer le projet de la homepage après confirmation
5. WHEN l'administrateur sauvegarde THEN le système SHALL mettre à jour la grille de projets sur la homepage
6. IF plus de 4 projets sont ajoutés THEN le système SHALL afficher les 4 plus récents sur la homepage

### Requirement 4 - Gestion des services

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir modifier les 3 services proposés (titre, description, liens), afin d'adapter mon offre selon l'évolution de mon activité.

#### Acceptance Criteria

1. WHEN l'administrateur accède à la gestion des services THEN le système SHALL afficher les 3 services actuels
2. WHEN l'administrateur modifie un service THEN le système SHALL permettre l'édition du titre, description et lien
3. WHEN l'administrateur sauvegarde THEN le système SHALL mettre à jour la section services sur la homepage
4. WHEN l'administrateur modifie l'ordre des services THEN le système SHALL permettre la réorganisation par drag & drop

### Requirement 5 - Gestion de la section offre/engagement

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir modifier les points clés de ma proposition de valeur dans la section "M'engager c'est...", afin d'ajuster mon message selon mon positionnement.

#### Acceptance Criteria

1. WHEN l'administrateur accède à la gestion de l'offre THEN le système SHALL afficher les 4 points actuels
2. WHEN l'administrateur modifie un point THEN le système SHALL permettre l'édition du texte
3. WHEN l'administrateur ajoute un nouveau point THEN le système SHALL permettre l'ajout avec validation (max 6 points)
4. WHEN l'administrateur supprime un point THEN le système SHALL retirer le point après confirmation
5. WHEN l'administrateur sauvegarde THEN le système SHALL mettre à jour la section offre sur la homepage

### Requirement 6 - Gestion des témoignages

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir ajouter, modifier et supprimer les témoignages clients, afin de présenter les retours les plus pertinents et récents.

#### Acceptance Criteria

1. WHEN l'administrateur accède à la gestion des témoignages THEN le système SHALL afficher la liste des témoignages actuels
2. WHEN l'administrateur ajoute un témoignage THEN le système SHALL permettre la saisie du texte, nom, titre, entreprise, photo et lien projet
3. WHEN l'administrateur modifie un témoignage THEN le système SHALL pré-remplir le formulaire avec les données actuelles
4. WHEN l'administrateur supprime un témoignage THEN le système SHALL retirer le témoignage après confirmation
5. WHEN l'administrateur réorganise les témoignages THEN le système SHALL permettre le drag & drop pour l'ordre d'affichage
6. WHEN l'administrateur sauvegarde THEN le système SHALL mettre à jour le slider de témoignages sur la homepage

### Requirement 7 - Gestion du footer

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir modifier les informations de contact, liens sociaux et liens de navigation du footer, afin de maintenir mes coordonnées à jour.

#### Acceptance Criteria

1. WHEN l'administrateur accède à la gestion du footer THEN le système SHALL afficher les sections : contact, liens site, réseaux pro, messageries
2. WHEN l'administrateur modifie l'email de contact THEN le système SHALL valider le format email et sauvegarder
3. WHEN l'administrateur modifie un lien social THEN le système SHALL permettre l'édition de l'URL et du texte
4. WHEN l'administrateur ajoute un nouveau lien THEN le système SHALL permettre l'ajout dans la catégorie appropriée
5. WHEN l'administrateur modifie le copyright THEN le système SHALL permettre l'édition du texte de copyright
6. WHEN l'administrateur sauvegarde THEN le système SHALL mettre à jour le footer sur la homepage

### Requirement 8 - Interface d'administration unifiée

**User Story:** En tant qu'administrateur du portfolio, je veux accéder à une interface CMS intuitive qui me permette de gérer toutes les sections depuis un seul endroit, afin d'avoir une vue d'ensemble et une gestion efficace.

#### Acceptance Criteria

1. WHEN l'administrateur accède au CMS THEN le système SHALL afficher un dashboard avec toutes les sections
2. WHEN l'administrateur clique sur une section THEN le système SHALL ouvrir l'interface d'édition correspondante
3. WHEN l'administrateur fait des modifications THEN le système SHALL indiquer visuellement les changements non sauvegardés
4. WHEN l'administrateur prévisualise THEN le système SHALL afficher un aperçu de la homepage avec les modifications
5. WHEN l'administrateur publie THEN le système SHALL appliquer toutes les modifications à la homepage en direct
6. IF l'administrateur quitte sans sauvegarder THEN le système SHALL demander confirmation pour éviter la perte de données

### Requirement 9 - Sauvegarde et versioning

**User Story:** En tant qu'administrateur du portfolio, je veux pouvoir sauvegarder mes modifications et revenir à une version précédente si nécessaire, afin de pouvoir expérimenter sans risque.

#### Acceptance Criteria

1. WHEN l'administrateur sauvegarde THEN le système SHALL créer une version horodatée des modifications
2. WHEN l'administrateur accède à l'historique THEN le système SHALL afficher les 10 dernières versions
3. WHEN l'administrateur restaure une version THEN le système SHALL demander confirmation et appliquer la version sélectionnée
4. WHEN une restauration est effectuée THEN le système SHALL créer une sauvegarde de l'état actuel avant la restauration
5. IF le système détecte une erreur THEN le système SHALL permettre la restauration automatique de la dernière version stable

### Requirement 10 - Responsive et performance

**User Story:** En tant qu'utilisateur visitant le portfolio, je veux que le site reste rapide et bien affiché sur tous les appareils, même avec le contenu géré par CMS, afin d'avoir une expérience optimale.

#### Acceptance Criteria

1. WHEN le contenu est modifié via CMS THEN le système SHALL maintenir la responsivité sur mobile, tablette et desktop
2. WHEN des images sont uploadées THEN le système SHALL optimiser automatiquement les images pour le web
3. WHEN la homepage se charge THEN le système SHALL maintenir un temps de chargement inférieur à 3 secondes
4. WHEN le contenu est mis à jour THEN le système SHALL invalider le cache et recharger le contenu
5. IF des images lourdes sont uploadées THEN le système SHALL les compresser automatiquement sans perte de qualité visible