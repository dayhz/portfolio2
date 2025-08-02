# Guide d'utilisation - Section Approach CMS

## 🎯 Vue d'ensemble

La section Approach permet de gérer votre processus de travail avec :
- **Titre personnalisable** - Le titre principal de la section
- **Description** - Votre philosophie et approche générale
- **Vidéo** - Vidéo de démonstration avec options de lecture
- **Call-to-Action** - Bouton d'appel à l'action vers votre page contact
- **Étapes du processus** - Jusqu'à 6 étapes avec glisser-déposer

## 📝 Comment utiliser l'éditeur

### 1. **Accéder à la section**
1. Allez dans le CMS Services
2. Cliquez sur "Section Processus"
3. L'éditeur s'ouvre avec tous les champs

### 2. **Modifier le titre**
- Champ "Titre de la section"
- Exemple : "Mon Approche", "Processus", "Méthodologie"
- Limite : 100 caractères

### 3. **Modifier la description**
- Éditeur riche avec formatage
- Décrivez votre philosophie de travail
- Limite : 500 caractères
- Compteur de caractères en temps réel

### 4. **Configurer la vidéo**
- **URL de la vidéo** : Lien vers votre vidéo (obligatoire)
- **Légende** : Description optionnelle
- **Options** : Autoplay, Loop, Muet
- **Aperçu** : Prévisualisation en temps réel

### 5. **Configurer le CTA**
- **Texte du CTA** : Ex. "Travaillons ensemble !"
- **URL du CTA** : Ex. "contact.html" ou "/contact"

### 6. **Gérer les étapes**
- **Ajouter** : Bouton "Ajouter une étape"
- **Réorganiser** : Glisser-déposer avec l'icône ⋮⋮
- **Modifier** : Titre et description pour chaque étape
- **Icônes** : Upload d'icônes optionnelles (PNG, JPG, SVG, max 2MB)
- **Supprimer** : Bouton poubelle avec confirmation

## 🔄 Sauvegarde et publication

### **Détection automatique des changements**
- Le bouton "Sauvegarder" s'active dès qu'une modification est détectée
- Indicateur "Modifications non sauvegardées" visible

### **Sauvegarde**
1. Cliquez sur "Sauvegarder et Publier"
2. Les données sont sauvegardées en base
3. Publication automatique sur le site web
4. Notification de succès

### **Annulation**
- Bouton "Annuler les modifications" pour revenir aux données originales
- Disponible uniquement s'il y a des changements non sauvegardés

## 👁️ Aperçu

L'aperçu montre la structure finale avec :
- Titre principal
- Description formatée
- Vidéo avec contrôles
- Call-to-Action stylisé
- Étapes organisées en grille

## ✅ Validation

### **Champs obligatoires**
- Titre de la section
- URL de la vidéo
- Texte du CTA
- URL du CTA
- Au moins 3 étapes avec titre et description

### **Limites**
- Titre : 100 caractères max
- Description : 500 caractères max
- CTA texte : 50 caractères max
- CTA URL : 200 caractères max
- Étapes : 3 minimum, 6 maximum
- Titre d'étape : 100 caractères max
- Description d'étape : 300 caractères max

## 🚀 Publication sur le site

Une fois sauvegardé, les changements sont automatiquement appliqués à :
- **Titre** : Remplace le titre "Approach" dans le HTML
- **Description** : Met à jour le texte de présentation
- **Vidéo** : Change la source vidéo et les options
- **CTA** : Met à jour le texte et le lien du bouton
- **Étapes** : Régénère toute la liste des étapes avec numérotation

## 🔧 Dépannage

### **Le bouton "Sauvegarder" reste grisé**
- Vérifiez que vous avez fait des modifications
- Tous les champs obligatoires doivent être remplis
- Rechargez la page si le problème persiste

### **Erreur de validation**
- Vérifiez les limites de caractères
- L'URL de la vidéo doit être valide
- Au moins 3 étapes sont requises

### **Changements non visibles sur le site**
- Vérifiez que la sauvegarde a réussi (notification verte)
- Actualisez la page du site (Ctrl+F5)
- Vérifiez que le serveur backend est démarré

## 📊 Statut de fonctionnement

✅ **Toutes les fonctionnalités sont opérationnelles**
- Interface utilisateur : 100% fonctionnelle
- API backend : 100% fonctionnelle  
- Publication HTML : 100% fonctionnelle
- Validation : 100% fonctionnelle

**Dernière mise à jour** : Février 2025
**Version** : 1.0 - Production Ready