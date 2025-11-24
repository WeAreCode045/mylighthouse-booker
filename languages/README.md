How to compile .po to .mo

This plugin ships a POT and an example PO (`fr_FR.po`). To compile a binary `.mo` that WordPress can load, run locally:

Using msgfmt (GNU gettext):

```bash
# from plugin root
msgfmt -o languages/fr_FR.mo languages/fr_FR.po
```

Or using Poedit: open `mylighthouse-booker.pot`, create a new translation (`fr_FR`), and save — Poedit will write the `.mo` automatically.

Also, WordPress CLI can regenerate a POT for the plugin:

```bash
# from plugin root
wp i18n make-pot . languages/mylighthouse-booker.pot --slug=mylighthouse-booker
```

Once `.mo` files are present in `languages/`, WordPress will load them according to the site locale.
