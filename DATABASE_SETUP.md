# Configuration de Base de Données - Neon vs Supabase

Ce guide explique comment configurer votre application pour utiliser soit **Neon** soit **Supabase** comme base de données.

## 🚀 Configuration Rapide

### Pour utiliser Neon (recommandé)

1. Dans votre fichier `.env`, ajoutez :
```bash
DATABASE_PROVIDER=neon
DATABASE_URL=postgresql://neondb_owner:npg...@ep-...neon.tech/neondb?sslmode=require
```

### Pour utiliser Supabase

1. Dans votre fichier `.env`, ajoutez :
```bash
DATABASE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📝 Exemple de fichier .env complet

```bash
# Configuration de la base de données
DATABASE_PROVIDER=neon

# ===== CONFIGURATION NEON =====
DATABASE_URL=postgresql://neondb_owner:npg...@ep-...neon.tech/neondb?sslmode=require

# ===== CONFIGURATION SUPABASE (si DATABASE_PROVIDER=supabase) =====
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔄 Comment basculer entre les deux

1. **Arrêtez votre serveur de développement** (`Ctrl+C`)
2. **Modifiez la variable `DATABASE_PROVIDER`** dans votre `.env`
3. **Redémarrez votre serveur** (`npm run dev`)

C'est tout ! L'application détectera automatiquement le changement et utilisera le bon client de base de données.

## 🏗️ Architecture

### Structure des données

#### Neon (nouvelle structure)
- Table `products` avec colonnes françaises (`nom_produit`, `prix_final_ttc`, etc.)
- Table `categories` séparée
- Table de liaison `product_categories`
- Support des catégories multiples par produit

#### Supabase (ancienne structure)
- Table `products` avec colonnes anglaises (`name`, `final_price_ttc`, etc.)
- Catégorie stockée directement dans la table `products`
- Une seule catégorie par produit

### Services

- **`UnifiedProductService`** : Service principal qui s'adapte automatiquement
- **`getDatabaseClient()`** : Factory qui retourne le bon client selon la configuration
- **Cache unifié** : Même système de cache pour les deux providers

## 📊 Migration des données

Si vous migrez de Supabase vers Neon, voici le mapping des colonnes :

| Supabase | Neon |
|----------|------|
| `name` | `nom_produit` |
| `reference_code` | `code_reference` |
| `available_for_order` | `disponible_pour_commande` |
| `quantity` | `quantite` |
| `final_price_ttc` | `prix_final_ttc` |
| `category` | Relations via `product_categories` |

## 🔧 Utilisation dans le code

```typescript
import { UnifiedProductService } from '@/lib/services/unified-product-service'

const productService = UnifiedProductService.getInstance()

// Fonctionne avec Neon et Supabase
const products = await productService.getProductsByCategory(['Électronique'])
const categories = await productService.getAvailableCategories()
const product = await productService.getProductById('123')
```

## 🐛 Dépannage

### Erreur de connexion Neon
- Vérifiez que `DATABASE_URL` contient la bonne chaîne de connexion
- Assurez-vous que `?sslmode=require` est présent dans l'URL

### Erreur de connexion Supabase
- Vérifiez les variables `SUPABASE_URL` et `SUPABASE_ANON_KEY`
- Pour les opérations serveur, `SUPABASE_SERVICE_ROLE_KEY` est requis

### Cache invalide après changement de provider
```typescript
const productService = UnifiedProductService.getInstance()
productService.clearCache()
productService.resetDatabaseClient()
```

## ⚡ Performance

- **Cache automatique** : 5 minutes de TTL
- **Pool de connexions** : Géré automatiquement pour Neon
- **Singleton pattern** : Un seul client par provider

## 🔐 Sécurité

- **Variables d'environnement** : Toutes les clés sensibles sont dans `.env`
- **SSL forcé** : Connexions chiffrées pour Neon
- **Service Role** : Utilisation des clés appropriées pour Supabase 