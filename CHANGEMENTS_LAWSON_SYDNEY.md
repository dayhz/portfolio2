# Changements effectués : Victor Berbel → Lawson Sydney

## Résumé des modifications

Tous les fichiers HTML du site ont été mis à jour pour remplacer "Victor Berbel" par "Lawson Sydney".

## Changements appliqués

### 1. **Nom complet**
- `Victor Berbel` → `Lawson Sydney`
- Dans tous les titres, métadonnées, et textes

### 2. **Prénom seul**
- `Victor` → `Lawson`
- Dans les textes de description et témoignages

### 3. **Domaines et URLs**
- `www.victorberbel.work` → `www.lawsonsydney.work`
- `victorberbel` → `lawsonsydney`

### 4. **Emails**
- `hey@victorberbel.work` → `hey@lawsonsydney.work`

## Fichiers modifiés

Tous les fichiers HTML du site ont été mis à jour :
- index.html
- services.html
- work.html
- about.html
- contact.html
- privacy.html
- Et tous les fichiers de projets individuels

## Éléments mis à jour

### Métadonnées HTML
- `<title>` tags
- Meta descriptions
- Open Graph tags
- Twitter cards
- Canonical URLs

### Contenu visible
- Titres de navigation
- Textes de description
- Témoignages clients
- Liens de contact
- Signatures et crédits

### Liens et références
- Aria-labels
- Liens mailto
- Références de domaine
- URLs internes

## Vérification

Pour vérifier que tous les changements ont été appliqués :

```bash
# Vérifier qu'il ne reste aucune référence à Victor
grep -r "Victor" portfolio2/www.victorberbel.work/ --include="*.html"

# Vérifier les nouvelles références à Lawson
grep -r "Lawson Sydney" portfolio2/www.victorberbel.work/ --include="*.html" | wc -l
```

## Statut
✅ **Terminé** - Tous les changements ont été appliqués avec succès.

Le site utilise maintenant "Lawson Sydney" comme nom principal dans tous les contextes.