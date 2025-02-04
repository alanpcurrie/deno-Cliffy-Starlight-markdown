import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "My Docs",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", link: "/guides/example/" },
            { label: 'pop', link: '/guides/pop' },
            { label: 'popper', link: '/guides/popper' },
            { label: 'popper', link: '/guides/popper' },
            { label: 'poppers', link: '/guides/poppers' },
            { label: 'nano', link: '/guides/nano' },
            { label: 'nano', link: '/guides/nano' },
            { label: 'nanook', link: '/guides/nanook' },
            { label: 'nanookish', link: '/guides/nanookish' },
            { label: 'duke', link: '/guides/duke' },
          
    { label: 'Deno Cliffy Starlight markdown', link: '/guides/deno_cliffy_starlight_markdown' },],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
