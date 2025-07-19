#!/usr/bin/env python3
"""
Script pour analyser les fichiers CSS inutilisés
"""

import os
import glob
import re

def analyze_unused_css():
    """Analyse les fichiers CSS inutilisés"""
    
    # Lister tous les fichiers CSS
    css_files = []
    for css_file in glob.glob('www.victorberbel.work/css/*.css'):
        css_files.append(os.path.basename(css_file))
    
    print("📁 Fichiers CSS trouvés :")
    for css in sorted(css_files):
        print(f"   - {css}")
    
    # Lister les pages principales
    main_pages = [
        'www.victorberbel.work/index.html',
        'www.victorberbel.work/services.html',
        'www.victorberbel.work/work.html', 
        'www.victorberbel.work/about.html',
        'www.victorberbel.work/contact.html'
    ]
    
    # Analyser les références CSS dans chaque page
    used_css = set()
    
    print("\n🔍 Analyse des références CSS :")
    
    for page in main_pages:
        if not os.path.exists(page):
            continue
            
        page_name = os.path.basename(page)
        print(f"\n📄 {page_name} :")
        
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Chercher toutes les références CSS
        css_refs = re.findall(r'href="css/([^"]+\.css)"', content)
        
        for css_ref in css_refs:
            used_css.add(css_ref)
            print(f"   ✅ {css_ref}")
    
    # Identifier les fichiers inutilisés
    unused_css = []
    for css_file in css_files:
        if css_file not in used_css:
            unused_css.append(css_file)
    
    print(f"\n📊 Résumé :")
    print(f"   Total CSS : {len(css_files)}")
    print(f"   CSS utilisés : {len(used_css)}")
    print(f"   CSS inutilisés : {len(unused_css)}")
    
    if unused_css:
        print(f"\n🗑️  Fichiers CSS inutilisés :")
        for css in sorted(unused_css):
            # Calculer la taille du fichier
            file_path = f'www.victorberbel.work/css/{css}'
            if os.path.exists(file_path):
                size = os.path.getsize(file_path)
                size_kb = size / 1024
                print(f"   ❌ {css} ({size_kb:.1f} KB)")
            else:
                print(f"   ❌ {css} (fichier non trouvé)")
        
        # Calculer l'espace total récupérable
        total_size = 0
        for css in unused_css:
            file_path = f'www.victorberbel.work/css/{css}'
            if os.path.exists(file_path):
                total_size += os.path.getsize(file_path)
        
        print(f"\n💾 Espace récupérable : {total_size/1024:.1f} KB")
    else:
        print(f"\n✅ Aucun fichier CSS inutilisé trouvé !")

if __name__ == "__main__":
    analyze_unused_css()