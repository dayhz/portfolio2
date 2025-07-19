#!/usr/bin/env python3
"""
Script pour mettre à jour les références JavaScript dans tous les fichiers HTML
Ajoute le fichier global-custom.js à toutes les pages
"""

import os
import re

def update_html_js_references():
    """Met à jour les références JavaScript dans tous les fichiers HTML"""
    
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
            
        page_name = os.path.basename(html_file)
        print(f"📝 Mise à jour de {page_name}")
        
        # Lire le fichier
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Ajouter le JS global avant les JS spécifiques
        # Chercher la ligne avec animations-main.js
        if 'animations-main.js' in content:
            # Chercher le pattern avec balise ouverte
            anchor_pattern = r'<script src="js/animations-main\.js" type="text/javascript">'
            if re.search(anchor_pattern, content):
                anchor = '<script src="js/animations-main.js" type="text/javascript">'
                replacement = '<script src="js/global-custom.js"></script>\n  ' + anchor
            else:
                print(f"⚠️  Pattern JS non trouvé dans {html_file}")
                continue
        else:
            print(f"⚠️  Ancre JS non trouvée dans {html_file}")
            continue
        
        # Remplacer seulement si le global-custom.js n'est pas déjà présent
        if 'global-custom.js' not in content:
            content = content.replace(anchor, replacement)
            
            # Sauvegarder le fichier
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {html_file} mis à jour")
        else:
            print(f"ℹ️  {html_file} déjà à jour")

if __name__ == "__main__":
    update_html_js_references()
    print("\n🎉 Mise à jour JavaScript terminée !")