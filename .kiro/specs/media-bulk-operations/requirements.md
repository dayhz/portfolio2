# Requirements Document - Opérations en masse sur les médias

## Introduction

Cette fonctionnalité permet aux utilisateurs du CMS de sélectionner et supprimer plusieurs médias en une seule opération, améliorant l'efficacité de la gestion de la médiathèque et évitant les doublons.

## Requirements

### Requirement 1

**User Story:** En tant qu'administrateur du CMS, je veux pouvoir sélectionner tous les médias d'un coup, afin de nettoyer rapidement ma médiathèque.

#### Acceptance Criteria

1. WHEN l'utilisateur clique sur "Tout sélectionner" THEN le système SHALL sélectionner tous les médias actuellement chargés
2. WHEN l'utilisateur clique sur "Supprimer la sélection" THEN le système SHALL demander une confirmation avec le nombre exact de médias
3. WHEN l'utilisateur confirme la suppression THEN le système SHALL supprimer TOUS les médias sélectionnés en une seule opération backend
4. WHEN la suppression est terminée THEN le système SHALL afficher un message de succès avec le nombre de médias supprimés

### Requirement 2

**User Story:** En tant qu'administrateur du CMS, je veux que la suppression en masse soit fiable et complète, afin d'éviter de devoir répéter l'opération plusieurs fois.

#### Acceptance Criteria

1. WHEN l'utilisateur lance une suppression en masse THEN le système SHALL capturer la liste complète des médias au moment du clic
2. WHEN la suppression est lancée THEN le système SHALL traiter tous les médias de la liste capturée en une seule requête
3. WHEN la suppression échoue partiellement THEN le système SHALL indiquer clairement quels médias ont été supprimés et lesquels ont échoué
4. WHEN la suppression est terminée THEN le système SHALL rafraîchir automatiquement la liste des médias

### Requirement 3

**User Story:** En tant qu'administrateur du CMS, je veux éviter les doublons de médias, afin de maintenir une médiathèque propre et organisée.

#### Acceptance Criteria

1. WHEN un utilisateur uploade un fichier THEN le système SHALL vérifier si un fichier avec le même nom existe déjà
2. IF un fichier avec le même nom existe THEN le système SHALL demander à l'utilisateur s'il veut remplacer ou renommer
3. WHEN l'utilisateur choisit de renommer THEN le système SHALL ajouter un suffixe unique au nom du fichier
4. WHEN l'utilisateur choisit de remplacer THEN le système SHALL supprimer l'ancien fichier et uploader le nouveau
5. WHEN le système détecte des doublons existants THEN il SHALL proposer un bouton "Supprimer les doublons" qui identifie et supprime automatiquement les fichiers en double basés sur le nom et la taille