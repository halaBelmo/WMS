# WMS Auth — Warehouse Management System

Pages d'authentification pour le projet WMS : inscription (création d'entreprise) et connexion utilisateur.

## Structure du projet

```
wms-auth/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Point d'entrée React
    ├── App.jsx               # Routeur principal (login ↔ signup)
    ├── styles/
    │   └── global.css        # Variables CSS globales + reset
    ├── components/
    │   ├── Logo.jsx          # Logo WMS réutilisable
    │   ├── Logo.module.css
    │   ├── FormField.jsx     # Champ de formulaire réutilisable
    │   ├── FormField.module.css
    │   ├── Button.jsx        # Bouton réutilisable (primary / outline)
    │   └── Button.module.css
    └── pages/
        ├── LoginPage.jsx     # Page connexion — utilisateur simple
        ├── LoginPage.module.css
        ├── SignupPage.jsx    # Page inscription — création d'entreprise
        └── SignupPage.module.css
```

## Installation et démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## Fonctionnalités

### Page Inscription (SignupPage)
- Badge "Compte administrateur"
- Formulaire en deux sections :
  - **Propriétaire** : prénom, nom, email, mot de passe
  - **Entreprise** : nom, adresse entrepôt, ville, pays
- Panneau latéral avec liste des fonctionnalités WMS
- Navigation vers la page de connexion

### Page Connexion (LoginPage)
- Badge "Accès utilisateur"
- Formulaire simple : email + mot de passe
- Option "Se souvenir de moi" + lien "Mot de passe oublié"
- Message informatif pour contacter l'administrateur
- Navigation vers la page d'inscription

## Composants réutilisables

### `<FormField />`
```jsx
<FormField
  label="Email"
  type="email"
  placeholder="exemple@mail.com"
  value={value}
  onChange={handleChange}
  icon={<SvgIcon />}
  required
/>
```

### `<Button />`
```jsx
<Button variant="primary" type="submit" fullWidth>
  Se connecter →
</Button>
```

## Personnalisation (variables CSS)

Modifier `src/styles/global.css` pour changer les couleurs :

```css
:root {
  --color-primary: #1a56db;        /* Couleur principale */
  --color-primary-hover: #1648c0;  /* Hover du bouton */
  --color-bg: #f5f7fb;             /* Fond de page */
  --color-surface: #ffffff;        /* Fond des cartes */
}
```
