#!/usr/bin/env python3
"""
Script pour nettoyer about.html en extrayant le CSS et JS inline
"""

import re
import os

def extract_and_clean_about():
    """Extrait le CSS et JS inline de about.html et les place dans des fichiers séparés"""
    
    # Lire le fichier about.html
    with open('www.victorberbel.work/about.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire tous les blocs <style>
    style_pattern = r'<style>(.*?)</style>'
    styles = re.findall(style_pattern, content, re.DOTALL)
    
    # Extraire tous les scripts inline (pas ceux avec src)
    script_pattern = r'<script(?![^>]*src)[^>]*>(.*?)</script>'
    scripts = re.findall(script_pattern, content, re.DOTALL)
    
    print(f"Trouvé {len(styles)} blocs de style")
    print(f"Trouvé {len(scripts)} scripts inline")
    
    # Créer le CSS consolidé
    css_content = "/* CSS extrait de about.html */\n\n"
    for i, style in enumerate(styles):
        if style.strip():  # Ignorer les styles vides
            css_content += f"/* Bloc CSS {i+1} */\n{style.strip()}\n\n"
    
    # Créer le JS consolidé
    js_content = "/* JavaScript extrait de about.html */\n\n"
    for i, script in enumerate(scripts):
        if script.strip():  # Ignorer les scripts vides
            js_content += f"/* Script {i+1} */\n{script.strip()}\n\n"
    
    # Sauvegarder les fichiers extraits
    with open('www.victorberbel.work/css/about-extracted.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    
    with open('www.victorberbel.work/js/about-extracted.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    # Nettoyer le HTML en supprimant les styles et scripts inline
    cleaned_content = content
    
    # Supprimer tous les blocs <style>
    cleaned_content = re.sub(r'<style>.*?</style>', '', cleaned_content, flags=re.DOTALL)
    
    # Supprimer les scripts inline (garder ceux avec src)
    cleaned_content = re.sub(r'<script(?![^>]*src)[^>]*>.*?</script>', '', cleaned_content, flags=re.DOTALL)
    
    # Nettoyer les lignes vides multiples
    cleaned_content = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned_content)
    
    # Ajouter les liens vers les nouveaux fichiers CSS dans le head
    head_insertion = '''  <link rel="stylesheet" href="css/about-custom.css" />
  <link rel="stylesheet" href="css/about-extracted.css" />'''
    
    cleaned_content = cleaned_content.replace(
        '<link href="css/slater-main.css" rel="stylesheet"/>',
        '<link href="css/slater-main.css" rel="stylesheet"/>\n' + head_insertion
    )
    
    # Ajouter les scripts avant la fermeture du body
    body_insertion = '''  <script src="js/about-custom.js"></script>
  <script src="js/about-extracted.js"></script>'''
    
    cleaned_content = cleaned_content.replace(
        '<script src="js/animations-about.js" type="text/javascript">',
        '<script src="js/animations-about.js" type="text/javascript"></script>\n' + body_insertion
    )
    
    # Sauvegarder le fichier nettoyé
    with open('www.victorberbel.work/about-clean.html', 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    
    print("✅ Extraction terminée !")
    print("📁 Fichiers créés :")
    print("   - css/about-extracted.css")
    print("   - js/about-extracted.js") 
    print("   - about-clean.html")

if __name__ == "__main__":
    extract_and_clean_about()