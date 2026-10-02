# Arman Jahangiri — Personal Academic Website v2

This repository contains the source for Arman Jahangiri's personal academic website and the editable LaTeX source for the Teaching Dossier.

## Repository structure

```text
.
├── site/                         # Website source deployed to GitHub Pages
│   ├── index.html
│   └── assets/
│       ├── css/
│       ├── js/
│       ├── images/
│       └── documents/
├── source/
│   └── teaching-dossier/         # Overleaf-compatible Teaching Dossier
│       ├── main.tex              # Main document in Overleaf
│       └── appendices/           # Evaluation, observation, certificate, and course PDFs
├── .github/workflows/deploy.yml  # Compiles dossier + deploys website
└── README.md
```

## Website workflow

Edit the public website in `site/`. The main page is `site/index.html`; global styling is in `site/assets/css/styles.css`, and animations/navigation are in `site/assets/js/main.js`.

Every push to `main` runs the GitHub Actions workflow. It:

1. compiles `source/teaching-dossier/main.tex`,
2. copies the fresh PDF into the website,
3. uploads the complete website to GitHub Pages.

The Teaching Dossier therefore stays synchronized with the website after changes are pushed from Overleaf/GitHub.

## Overleaf

Import this repository as a GitHub project in Overleaf and set the Main document to:

```text
source/teaching-dossier/main.tex
```

Do not edit the generated dossier PDF directly; edit `main.tex` and the appendix files instead.

## Deployment name

During testing, this repository can be called `armanjg.github.io-v2`, which publishes as a project site. When ready to replace the current personal site, archive/rename the old `armanjg.github.io` repository and rename this repository to `armanjg.github.io` so the final URL is:

```text
https://armanjg.github.io/
```
