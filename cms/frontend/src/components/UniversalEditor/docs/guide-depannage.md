# Guide de Dépannage - Éditeur Universel Portfolio

Ce guide vous aide à résoudre les problèmes courants que vous pourriez rencontrer lors de l'utilisation de l'Éditeur Universel Portfolio.

## Table des matières

1. [Problèmes de performance](#problèmes-de-performance)
2. [Problèmes de sauvegarde](#problèmes-de-sauvegarde)
3. [Problèmes d'affichage](#problèmes-daffichage)
4. [Problèmes avec les médias](#problèmes-avec-les-médias)
5. [Problèmes d'édition](#problèmes-dédition)
6. [Problèmes d'export](#problèmes-dexport)
7. [Problèmes de compatibilité](#problèmes-de-compatibilité)
8. [Récupération de données](#récupération-de-données)
9. [Contacter le support](#contacter-le-support)

## Problèmes de performance

### L'éditeur est lent ou saccadé

**Symptômes :** Temps de réponse lent, animations saccadées, délai lors de la saisie.

**Solutions :**

1. **Réduire la taille du contenu :**
   - Divisez les projets volumineux en plusieurs pages
   - Limitez le nombre d'images haute résolution

2. **Activer le mode performance :**
   - Allez dans "Paramètres" > "Performance"
   - Activez "Mode performance"

3. **Optimiser les médias :**
   - Allez dans "Outils" > "Optimisation des médias"
   - Cliquez sur "Optimiser tout"

4. **Nettoyer le cache du navigateur :**
   - Fermez et rouvrez l'éditeur
   - Videz le cache de votre navigateur

5. **Vérifier les ressources système :**
   - Fermez les applications inutilisées
   - Vérifiez l'utilisation de la mémoire et du CPU

### Consommation excessive de mémoire

**Symptômes :** L'éditeur devient de plus en plus lent au fil du temps, le navigateur affiche des avertissements de mémoire.

**Solutions :**

1. **Activer le nettoyage automatique de la mémoire :**
   - Dans "Paramètres" > "Performance"
   - Activez "Nettoyage mémoire automatique"

2. **Réduire la taille de l'historique :**
   - Dans "Paramètres" > "Historique"
   - Réduisez le nombre de versions conservées

3. **Redémarrer l'éditeur régulièrement :**
   - Sauvegardez votre travail
   - Fermez et rouvrez l'éditeur toutes les quelques heures

## Problèmes de sauvegarde

### Les modifications ne sont pas sauvegardées

**Symptômes :** L'indicateur de sauvegarde reste en attente, les modifications disparaissent après actualisation.

**Solutions :**

1. **Vérifier la connexion internet :**
   - Assurez-vous d'être connecté à internet
   - Testez votre connexion sur un autre site

2. **Forcer une sauvegarde manuelle :**
   - Appuyez sur Ctrl+S (ou Cmd+S sur Mac)
   - Vérifiez si l'indicateur de sauvegarde confirme la sauvegarde

3. **Vérifier l'espace de stockage :**
   - Assurez-vous que votre compte dispose d'espace suffisant
   - Supprimez les anciens projets ou médias inutilisés si nécessaire

4. **Utiliser l'export local :**
   - Cliquez sur "Exporter" > "Exporter en local"
   - Sauvegardez le fichier JSON sur votre ordinateur

5. **Vérifier les erreurs dans la console :**
   - Ouvrez les outils de développement du navigateur (F12)
   - Recherchez des erreurs liées à la sauvegarde

### Conflit de versions

**Symptômes :** Message d'erreur indiquant un conflit de versions, impossibilité de sauvegarder.

**Solutions :**

1. **Résoudre le conflit :**
   - Dans la boîte de dialogue de conflit, choisissez "Comparer les versions"
   - Sélectionnez les modifications à conserver

2. **Forcer la sauvegarde :**
   - Si nécessaire, utilisez "Forcer la sauvegarde de ma version"
   - Attention : cela écrasera les modifications d'autres utilisateurs

3. **Exporter votre version :**
   - Utilisez "Exporter ma version"
   - Contactez les autres collaborateurs pour coordonner les modifications

## Problèmes d'affichage

### Éléments mal alignés ou styles incorrects

**Symptômes :** Les blocs ne s'affichent pas comme prévu, problèmes d'alignement, styles manquants.

**Solutions :**

1. **Recharger les styles :**
   - Cliquez sur "Outils" > "Recharger les styles"
   - Attendez que les styles soient réappliqués

2. **Vérifier la compatibilité du template :**
   - Assurez-vous que le template sélectionné est compatible avec vos blocs
   - Essayez de changer temporairement de template pour identifier le problème

3. **Réinitialiser les styles personnalisés :**
   - Dans "Options du template" > "Apparence"
   - Cliquez sur "Réinitialiser aux valeurs par défaut"

4. **Vérifier les conflits CSS :**
   - Activez le mode diagnostic (Ctrl+Alt+D)
   - Recherchez les avertissements liés aux styles

### Problèmes d'affichage responsive

**Symptômes :** Le contenu ne s'adapte pas correctement aux différentes tailles d'écran.

**Solutions :**

1. **Tester en mode responsive :**
   - Activez le mode responsive
   - Testez sur différentes tailles d'écran

2. **Vérifier les règles responsive :**
   - Sélectionnez le bloc problématique
   - Vérifiez les "Options responsive" dans la barre d'outils contextuelle

3. **Appliquer des corrections spécifiques :**
   - Ajustez les paramètres pour chaque taille d'écran
   - Utilisez "Appliquer à toutes les tailles" si nécessaire

4. **Réinitialiser les paramètres responsive :**
   - Sélectionnez le bloc
   - Cliquez sur "Réinitialiser responsive" dans les options avancées

## Problèmes avec les médias

### Les images ne se chargent pas

**Symptômes :** Images manquantes, icônes de chargement persistantes, espaces vides.

**Solutions :**

1. **Vérifier l'URL de l'image :**
   - Sélectionnez le bloc image
   - Vérifiez que l'URL dans les propriétés est correcte

2. **Réuploader l'image :**
   - Supprimez l'image problématique
   - Téléchargez-la à nouveau depuis votre ordinateur

3. **Vérifier le format et la taille :**
   - Assurez-vous que le format est pris en charge (JPG, PNG, WebP, etc.)
   - Vérifiez que la taille du fichier n'est pas excessive (< 10 MB)

4. **Vider le cache des médias :**
   - Dans "Outils" > "Médias"
   - Cliquez sur "Vider le cache des médias"

5. **Vérifier les restrictions du navigateur :**
   - Assurez-vous que votre navigateur n'a pas bloqué le chargement des images
   - Vérifiez les paramètres de confidentialité et de cookies

### Problèmes d'upload de médias

**Symptômes :** Échec des uploads, messages d'erreur lors du téléchargement, uploads incomplets.

**Solutions :**

1. **Vérifier la taille du fichier :**
   - Assurez-vous que le fichier ne dépasse pas la limite (généralement 50 MB)
   - Compressez les fichiers volumineux avant l'upload

2. **Vérifier le format du fichier :**
   - Assurez-vous que le format est pris en charge
   - Convertissez si nécessaire vers un format compatible

3. **Tester avec un fichier plus petit :**
   - Essayez d'uploader un petit fichier pour vérifier si le problème persiste
   - Si cela fonctionne, le problème est lié à la taille ou au format

4. **Utiliser la méthode alternative d'upload :**
   - Au lieu de glisser-déposer, utilisez le bouton "Parcourir"
   - Ou essayez d'importer depuis une URL

5. **Vérifier l'espace de stockage disponible :**
   - Assurez-vous que votre compte dispose d'espace suffisant
   - Supprimez les médias inutilisés si nécessaire

## Problèmes d'édition

### Le curseur saute ou se déplace de façon inattendue

**Symptômes :** Le curseur change de position pendant la saisie, sélection de texte instable.

**Solutions :**

1. **Désactiver les extensions de navigateur :**
   - Certaines extensions peuvent interférer avec l'éditeur
   - Essayez en mode navigation privée

2. **Vérifier les raccourcis clavier :**
   - Assurez-vous de ne pas activer accidentellement des raccourcis
   - Désactivez temporairement les raccourcis dans les paramètres

3. **Réduire la taille du document :**
   - Les documents très longs peuvent causer des problèmes de performance
   - Divisez le contenu en plusieurs pages si nécessaire

4. **Mettre à jour le navigateur :**
   - Assurez-vous d'utiliser la dernière version de votre navigateur
   - Essayez un autre navigateur si le problème persiste

### Formatage de texte incorrect

**Symptômes :** Le formatage (gras, italique, etc.) ne s'applique pas correctement ou disparaît.

**Solutions :**

1. **Vérifier la sélection de texte :**
   - Assurez-vous de sélectionner tout le texte à formater
   - Essayez de sélectionner un peu plus de texte que nécessaire

2. **Utiliser les raccourcis clavier :**
   - Utilisez Ctrl+B pour le gras, Ctrl+I pour l'italique, etc.
   - Ces raccourcis sont souvent plus fiables que les boutons

3. **Nettoyer le formatage :**
   - Sélectionnez le texte problématique
   - Utilisez "Supprimer le formatage" (Ctrl+Shift+D)
   - Réappliquez le formatage souhaité

4. **Vérifier les styles du template :**
   - Certains templates peuvent remplacer le formatage manuel
   - Vérifiez les styles par défaut dans les options du template

## Problèmes d'export

### L'export échoue ou est incomplet

**Symptômes :** Messages d'erreur lors de l'export, fichiers d'export vides ou incomplets.

**Solutions :**

1. **Vérifier la validation du contenu :**
   - Exécutez "Outils" > "Valider le contenu"
   - Corrigez les erreurs signalées

2. **Réduire la complexité :**
   - Exportez des sections plus petites séparément
   - Simplifiez les blocs complexes

3. **Changer le format d'export :**
   - Si l'export HTML échoue, essayez le format JSON
   - Ou inversement

4. **Vérifier les médias liés :**
   - Assurez-vous que tous les médias sont correctement chargés
   - Utilisez "Inclure les médias" dans les options d'export

5. **Utiliser l'export progressif :**
   - Dans "Exporter" > "Options avancées"
   - Activez "Export progressif" pour les projets volumineux

### Différences entre prévisualisation et export

**Symptômes :** Le contenu exporté ne correspond pas à ce qui est affiché dans l'éditeur.

**Solutions :**

1. **Vérifier la compatibilité du template :**
   - Assurez-vous que le template d'export correspond à celui de l'éditeur
   - Certains éléments peuvent s'afficher différemment selon le template

2. **Vérifier les options d'export :**
   - Dans "Exporter" > "Options avancées"
   - Assurez-vous que "Conserver les styles exacts" est activé

3. **Tester avec différents navigateurs :**
   - Le rendu peut varier légèrement entre les navigateurs
   - Testez l'export dans le même navigateur que celui utilisé pour l'édition

4. **Utiliser l'export WYSIWYG strict :**
   - Dans "Exporter" > "Options avancées"
   - Activez "Mode WYSIWYG strict"

## Problèmes de compatibilité

### Problèmes avec certains navigateurs

**Symptômes :** L'éditeur ne fonctionne pas correctement dans certains navigateurs.

**Solutions :**

1. **Utiliser un navigateur recommandé :**
   - Chrome, Firefox, Edge ou Safari dans leurs versions récentes
   - Évitez les navigateurs anciens ou peu courants

2. **Mettre à jour votre navigateur :**
   - Assurez-vous d'utiliser la dernière version
   - Les anciennes versions peuvent manquer de fonctionnalités nécessaires

3. **Désactiver les extensions :**
   - Certaines extensions peuvent interférer avec l'éditeur
   - Testez en mode navigation privée

4. **Vérifier les paramètres de confidentialité :**
   - Assurez-vous que les cookies et le stockage local sont autorisés
   - Vérifiez que JavaScript est activé

### Problèmes sur appareils mobiles

**Symptômes :** Interface mal adaptée, difficultés d'édition sur smartphone ou tablette.

**Solutions :**

1. **Utiliser l'interface mobile dédiée :**
   - L'éditeur devrait automatiquement basculer vers l'interface mobile
   - Si ce n'est pas le cas, cliquez sur "Passer en mode mobile"

2. **Orienter l'écran en paysage :**
   - Sur les petits écrans, l'orientation paysage offre plus d'espace
   - Activez la rotation automatique sur votre appareil

3. **Utiliser un clavier externe :**
   - Pour une édition plus confortable sur tablette
   - Les raccourcis clavier fonctionneront également

4. **Limiter les opérations complexes :**
   - Certaines fonctionnalités avancées sont mieux adaptées aux ordinateurs
   - Privilégiez les modifications simples sur mobile

## Récupération de données

### Récupérer du contenu non sauvegardé

**Symptômes :** Perte de modifications après un crash ou une fermeture accidentelle.

**Solutions :**

1. **Vérifier la récupération automatique :**
   - À la réouverture de l'éditeur, recherchez la notification "Contenu non sauvegardé récupéré"
   - Cliquez sur "Restaurer" si proposé

2. **Accéder aux sauvegardes locales :**
   - Dans "Outils" > "Récupération"
   - Recherchez dans "Sauvegardes automatiques locales"

3. **Vérifier l'historique des versions :**
   - Ouvrez l'historique des versions
   - Recherchez la dernière version sauvegardée

4. **Utiliser la récupération d'urgence :**
   - Dans "Outils" > "Récupération"
   - Cliquez sur "Récupération d'urgence"
   - Suivez les instructions pour rechercher dans le stockage local du navigateur

### Restaurer une version précédente

**Symptômes :** Besoin de revenir à un état antérieur du document.

**Solutions :**

1. **Utiliser l'historique des versions :**
   - Cliquez sur "Historique" dans la barre d'outils
   - Sélectionnez la version souhaitée
   - Cliquez sur "Restaurer cette version"

2. **Restauration partielle :**
   - Dans l'historique, sélectionnez la version souhaitée
   - Cliquez sur "Restauration partielle"
   - Sélectionnez uniquement les blocs à restaurer

3. **Exporter/importer une version :**
   - Exportez la version souhaitée en JSON
   - Créez un nouveau document
   - Importez le fichier JSON

## Contacter le support

Si vous ne parvenez pas à résoudre votre problème avec ce guide :

1. **Préparer les informations nécessaires :**
   - Description détaillée du problème
   - Étapes pour reproduire le problème
   - Captures d'écran ou vidéos si possible
   - Informations sur votre navigateur et système d'exploitation
   - Journal de diagnostic (accessible via "Outils" > "Diagnostic" > "Exporter le journal")

2. **Contacter le support :**
   - Via le bouton "Aide" > "Contacter le support"
   - Ou par email à support@portfolio-editor.com
   - Incluez toutes les informations préparées

3. **Utiliser le forum de la communauté :**
   - Visitez forum.portfolio-editor.com
   - Recherchez si d'autres utilisateurs ont rencontré le même problème
   - Créez un nouveau sujet si nécessaire

---

Ce guide de dépannage est régulièrement mis à jour pour couvrir les problèmes les plus courants. Si vous rencontrez un problème non mentionné ici, n'hésitez pas à contacter notre équipe de support.