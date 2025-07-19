#!/usr/bin/env python3
"""
Script pour analyser les pages HTML inutilisées
"""

import os
import glob
import re

def analyze_unused_html():
    """Analyse les pages HTML inutilisées"""
    
    # Lister tous les fichiers HTML
    html_files = []
    for html_file in glob.glob('www.victorberbel.work/*.html'):
        html_files.append(os.path.basename(html_file))
    
    print("📁 Pages HTML trouvées :")
    for html in sorted(html_files):
        print(f"   - {html}")
    
    # Catégoriser les pages
    main_pages = [
        'index.html',
        'services.html', 
        'work.html',
        'about.html',
        'contact.html'
    ]
    
    backup_pages = [
        'index-original.html',
        'services-original.html',
        'work-original.html',
        'about-original.html',
        'contact-original.html'
    ]
    
    test_pages = [
        'test-animations.html',
        'test-title-animations.html'
    ]
    
    portfolio_pages = [
        'booksprout-saas.html',
        'booksprout.html',
        'greco-gum.html',
        'investy-club.html',
        'journaler.html',
        'moments.html',
        'netflix.html',
        'nobe-saas.html',
        'nobe.html',
        'ordine.html',
        'poesial.html',
        'zesty.html'
    ]
    
    filter_pages = [
        'work@filter=mobile.html',
        'work@filter=product.html',
        'work@filter=website.html'
    ]
    
    utility_pages = [
        'privacy.html'
    ]
    
    # Analyser les liens internes dans les pages principales
    internal_links = set()
    
    for page in main_pages:
        page_path = f'www.victorberbel.work/{page}'
        if os.path.exists(page_path):
            with open(page_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Chercher les liens href vers d'autres pages HTML
            links = re.findall(r'href="([^"]+\.html)"', content)
            for link in links:
                # Nettoyer le lien (enlever les paramètres, etc.)
                clean_link = link.split('?')[0].split('#')[0]
                if not clean_link.startswith('http'):
                    internal_links.add(clean_link)
    
    print(f"\n🔗 Liens internes trouvés dans les pages principales :")
    for link in sorted(internal_links):
        print(f"   - {link}")
    
    # Identifier les pages inutilisées
    used_pages = set(main_pages + list(internal_links))
    unused_pages = []
    
    for html_file in html_files:
        if html_file not in used_pages:
            unused_pages.append(html_file)
    
    print(f"\n📊 Résumé :")
    print(f"   Total pages HTML : {len(html_files)}")
    print(f"   Pages principales : {len(main_pages)}")
    print(f"   Pages liées : {len(internal_links)}")
    print(f"   Pages utilisées : {len(used_pages)}")
    print(f"   Pages inutilisées : {len(unused_pages)}")
    
    if unused_pages:
        print(f"\n📋 Catégorisation des pages inutilisées :")
        
        backup_unused = [p for p in unused_pages if p in backup_pages]
        test_unused = [p for p in unused_pages if p in test_pages]
        portfolio_unused = [p for p in unused_pages if p in portfolio_pages]
        filter_unused = [p for p in unused_pages if p in filter_pages]
        utility_unused = [p for p in unused_pages if p in utility_pages]
        other_unused = [p for p in unused_pages if p not in backup_pages + test_pages + portfolio_pages + filter_pages + utility_pages]
        
        if backup_unused:
            print(f"\n💾 Pages de sauvegarde ({len(backup_unused)}) :")
            for page in sorted(backup_unused):
                size = os.path.getsize(f'www.victorberbel.work/{page}') / 1024
                print(f"   ❌ {page} ({size:.1f} KB)")
        
        if test_unused:
            print(f"\n🧪 Pages de test ({len(test_unused)}) :")
            for page in sorted(test_unused):
                size = os.path.getsize(f'www.victorberbel.work/{page}') / 1024
                print(f"   ❌ {page} ({size:.1f} KB)")
        
        if portfolio_unused:
            print(f"\n🎨 Pages de portfolio ({len(portfolio_unused)}) :")
            for page in sorted(portfolio_unused):
                size = os.path.getsize(f'www.victorberbel.work/{page}') / 1024
                print(f"   ⚠️  {page} ({size:.1f} KB) - Peut-être utilisée via work.html")
        
        if filter_unused:
            print(f"\n🔍 Pages de filtres ({len(filter_unused)}) :")
            for page in sorted(filter_unused):
                size = os.path.getsize(f'www.victorberbel.work/{page}') / 1024
                print(f"   ⚠️  {page} ({size:.1f} KB) - Peut-être utilisée via JavaScript")
        
        if utility_unused:
            print(f"\n📄 Pages utilitaires ({len(utility_unused)}) :")
            for page in sorted(utility_unused):
                size = os.path.getsize(f'www.victorberbel.work/{page}') / 1024
                print(f"   ⚠️  {page} ({size:.1f} KB) - Peut-être nécessaire légalement")
        
        if other_unused:
            print(f"\n❓ Autres pages ({len(other_unused)}) :")
            for page in sorted(other_unused):
                size = os.path.getsize(f'www.victorberbel.work/{page}') / 1024
                print(f"   ❌ {page} ({size:.1f} KB)")
        
        # Calculer l'espace total récupérable
        total_size = 0
        safe_to_delete = backup_unused + test_unused
        
        for page in safe_to_delete:
            total_size += os.path.getsize(f'www.victorberbel.work/{page}')
        
        print(f"\n💾 Espace récupérable (pages sûres à supprimer) : {total_size/1024:.1f} KB")
        
        if safe_to_delete:
            print(f"\n✅ Pages sûres à supprimer :")
            for page in sorted(safe_to_delete):
                print(f"   🗑️  {page}")
    
    else:
        print(f"\n✅ Aucune page HTML inutilisée trouvée !")

if __name__ == "__main__":
    analyze_unused_html()