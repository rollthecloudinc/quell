import { ContentPlugin } from "@rollthecloudinc/content"

export interface ContentSelector {
    scrollTo(cls: string): void
    onEntitySelected(plugin: ContentPlugin): void
}
export interface ContentEditorRenderer {
    onPreviewClose(): void
}
export interface EditablePane {
    onPropsClick(): void
    openMenu(): void
    closeMenu(): void
    toggleMenu(): void
}