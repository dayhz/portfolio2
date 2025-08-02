# 🔍 GUIDE DE TEST DEBUG - Testimonials

## 🎯 Objectif
Identifier exactement où le processus de publication échoue en suivant les logs de debug.

## 📋 Étapes de test

### 1. 🚀 Démarrer les serveurs

```bash
# Terminal 1 - Backend
cd cms/backend
npm run dev

# Terminal 2 - Frontend  
cd cms/frontend
npm run dev
```

### 2. 🌐 Ouvrir le CMS

1. Va sur : http://localhost:3000/services
2. Clique sur "Section Témoignages"

### 3. ➕ Ajouter un témoignage de test

**Données de test simples :**
- **Texte** : "Test de debug - Ce témoignage sert à tester la publication automatique."
- **Nom** : "Debug User"  
- **Titre** : "Testeur Debug"
- **Entreprise** : "Debug Corp" (optionnel)
- **Projet** : "Debug Project" (optionnel)

### 4. 💾 Sauvegarder et observer les logs

Clique sur "Sauvegarder" et regarde attentivement les logs dans :

#### 🖥️ Console du navigateur (F12)
Tu devrais voir :
```
🔍 DEBUG: handleTestimonialsSave appelé avec {testimonials: [...]}
🔍 DEBUG: Appel servicesAPI.updateSection...
🔍 DEBUG: Réponse updateSection: {success: true, ...}
🔍 DEBUG: Appel servicesAPI.publish...
🔍 DEBUG: Réponse publish: {publishedAt: "...", isPublished: true}
```

#### 🖥️ Terminal du backend
Tu devrais voir :
```
🔍 DEBUG: publishContent appelé
🔍 DEBUG: Récupération des données testimonials...
🔍 DEBUG: Données testimonials récupérées: {testimonials: [...]}
🔍 DEBUG: Path vers services.html: /path/to/services.html
🔍 DEBUG: Appel testimonialsHtmlGenerator.updateServicesHtml...
✅ Services HTML updated with testimonials
```

### 5. 🔍 Analyser les résultats

#### ✅ Si tous les logs apparaissent :
- Le processus fonctionne !
- Vérifie le fichier `portfolio2/www.victorberbel.work/services.html`
- Cherche "Debug User" dans le fichier

#### ❌ Si des logs manquent :

**Cas 1 : Pas de logs frontend**
- Le bouton "Sauvegarder" n'est pas connecté
- Problème dans TestimonialsEditor

**Cas 2 : Logs frontend OK, pas de logs backend**  
- Problème dans l'API (routes ou servicesAPI)
- Vérifier les erreurs réseau dans F12 > Network

**Cas 3 : Logs backend partiels**
- Erreur dans getTestimonialsData() ou updateServicesHtml()
- Regarder les erreurs dans le terminal backend

**Cas 4 : Tous les logs OK mais pas de changement dans services.html**
- Problème dans testimonialsHtmlGenerator
- Vérifier les permissions du fichier

### 6. 📄 Vérifier le fichier services.html

```bash
# Chercher le témoignage de test
grep -n "Debug User" portfolio2/www.victorberbel.work/services.html

# Voir la date de dernière modification
ls -la portfolio2/www.victorberbel.work/services.html
```

## 🚨 Problèmes courants et solutions

### Problème : Aucun log frontend
**Solution :** Le bouton n'appelle pas handleTestimonialsSave
- Vérifier que onSave={handleTestimonialsSave} dans TestimonialsEditor

### Problème : Erreur 404 sur l'API
**Solution :** Routes backend non configurées
- Vérifier que le serveur backend tourne sur le bon port
- Vérifier les routes dans backend/src/routes/services.ts

### Problème : Données vides dans getTestimonialsData
**Solution :** Pas de données en base
- Les données ne sont pas sauvées correctement
- Vérifier updateSectionContent dans servicesService

### Problème : Erreur de fichier dans updateServicesHtml
**Solution :** Problème de path ou permissions
- Vérifier que le path vers services.html est correct
- Vérifier les permissions d'écriture

## 📊 Résultat attendu

Après le test, tu devrais :
1. ✅ Voir tous les logs de debug
2. ✅ Voir "Debug User" dans services.html  
3. ✅ Voir la date de modification du fichier mise à jour

## 🎯 Prochaines étapes

Une fois le problème identifié :
1. Corriger le problème spécifique
2. Retester avec les logs
3. Supprimer les logs de debug
4. Tester avec de vraies données

---

**💡 Astuce :** Garde les deux terminaux (backend/frontend) visibles pendant le test pour voir les logs en temps réel !