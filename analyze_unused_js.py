#!/usr/bin/env python3
"""
Script pour analyser les fichiers JavaScript inutilisés
"""

import os
import glob
import re

def analyze_unused_js():
    """Analyse les fichiers JavaScript inutilisés"""
    
    # Lister tous les fichiers JS
    js_files = []
    for js_file in glob.glob('www.victorberbel.work/js/*.js'):
        js_files.append(os.path.basename(js_file))
    
    print("📁 Fichiers JavaScript trouvés :")
    for js in sorted(js_files):
        print(f"   - {js}")
    
    # Lister les pages principales
    main_pages = [
        'www.victorberbel.work/index.html',
        'www.victorberbel.work/services.html',
        'www.victorberbel.work/work.html', 
        'www.victorberbel.work/about.html',
        'www.victorberbel.work/contact.html'
    ]
    
    # Analyser les références JS dans chaque page
    used_js = set()
    
    print("\n🔍 Analyse des références JavaScript :")
    
    for page in main_pages:
        if not os.path.exists(page):
            continue
            
        page_name = os.path.basename(page)
        print(f"\n📄 {page_name} :")
        
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Chercher toutes les références JS
        js_refs = re.findall(r'src="js/([^"]+\.js)"', content)
        
        for js_ref in js_refs:
            used_js.add(js_ref)
            print(f"   ✅ {js_ref}")
    
    # Identifier les fichiers inutilisés
    unused_js = []
    for js_file in js_files:
        if js_file not in used_js:
            unused_js.append(js_file)
    
    print(f"\n📊 Résumé :")
    print(f"   Total JS : {len(js_files)}")
    print(f"   JS utilisés : {len(used_js)}")
    print(f"   JS inutilisés : {len(unused_js)}")
    
    if unused_js:
        print(f"\n🗑️  Fichiers JavaScript inutilisés :")
        total_size = 0
        for js in sorted(unused_js):
            # Calculer la taille du fichier
            file_path = f'www.victorberbel.work/js/{js}'
            if os.path.exists(file_path):
                size = os.path.getsize(file_path)
                size_kb = size / 1024
                total_size += size
                print(f"   ❌ {js} ({size_kb:.1f} KB)")
            else:
                print(f"   ❌ {js} (fichier non trouvé)")
        
        print(f"\n💾 Espace récupérable : {total_size/1024:.1f} KB")
        
        # Analyser les types de fichiers inutilisés
        custom_unused = [js for js in unused_js if 'custom' in js]
        extracted_unused = [js for js in unused_js if 'extracted' in js]
        animations_unused = [js for js in unused_js if 'animations' in js]
        webflow_unused = [js for js in unused_js if 'webflow' in js]
        other_unused = [js for js in unused_js if js not in custom_unused + extracted_unused + animations_unused + webflow_unused]
        
        print(f"\n📋 Catégories de fichiers inutilisés :")
        if custom_unused:
            print(f"   🎨 Custom : {len(custom_unused)} fichiers")
        if extracted_unused:
            print(f"   📤 Extracted : {len(extracted_unused)} fichiers")
        if animations_unused:
            print(f"   🎬 Animations : {len(animations_unused)} fichiers")
        if webflow_unused:
            print(f"   🌊 Webflow : {len(webflow_unused)} fichiers")
        if other_unused:
            print(f"   📦 Autres : {len(other_unused)} fichiers")
            
    else:
        print(f"\n✅ Aucun fichier JavaScript inutilisé trouvé !")

if __name__ == "__main__":
    analyze_unused_js()