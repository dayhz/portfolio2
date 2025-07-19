#!/usr/bin/env python3
"""
Script pour mettre à jour les références CSS dans tous les fichiers HTML
Ajoute le fichier global-custom.css à toutes les pages
"""

import os
import re

def update_html_css_references():
    """Met à jour les références CSS dans tous les fichiers HTML"""
    
    html_files = [
        'www.victorberbel.work/index.html',
        'www.victorberbel.work/services.html', 
        'www.victorberbel.work/work.html',
        'www.victorberbel.work/about.html',
        'www.victorberbel.work/contact.html'
    ]
    
    for html_file in html_files:
        if not os.path.exists(html_file):
            print(f"⚠️  Fichier non trouvé : {html_file}")
            continue
            
        print(f"📝 Mise à jour de {html_file}")
        
        # Lire le fichier
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Ajouter le CSS global avant les CSS spécifiques
        # Chercher la ligne avec animation-fixes.css ou slater-main.css
        if 'animation-fixes.css' in content:
            anchor = '<link href="css/animation-fixes.css" rel="stylesheet"/>'
            replacement = anchor + '\n  <link rel="stylesheet" href="css/global-custom.css" />'
        elif 'slater-main.css' in content:
            anchor = '<link href="css/slater-main.css" rel="stylesheet"/>'
            replacement = anchor + '\n  <link rel="stylesheet" href="css/global-custom.css" />'
        else:
            print(f"⚠️  Ancre CSS non trouvée dans {html_file}")
            continue
        
        # Remplacer seulement si le global-custom.css n'est pas déjà présent
        if 'global-custom.css' not in content:
            content = content.replace(anchor, replacement)
            
            # Sauvegarder le fichier
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {html_file} mis à jour")
        else:
            print(f"ℹ️  {html_file} déjà à jour")

if __name__ == "__main__":
    update_html_css_references()
    print("\n🎉 Mise à jour terminée !")