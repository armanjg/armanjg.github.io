# Organization Notes

The original website mixed HTML pages, current and obsolete images, preview graphics, certificates, project reports, and teaching documents in the repository root. This v2 repository separates concerns:

- `site/` contains only deployable website material.
- `site/assets/images/` contains profile and preview images.
- `site/assets/documents/` groups research, project, teaching, and service documents.
- `source/teaching-dossier/` contains the authoritative Overleaf/LaTeX project.
- `.github/workflows/deploy.yml` compiles the dossier and deploys the site.

The original repository should remain unchanged as an archive until v2 is fully tested and promoted to the root GitHub Pages URL.
