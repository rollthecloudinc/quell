import { CursorOverlayService, resolveTargetElement, TimelineStep, waitForComponent } from "@rollthecloudinc/detour"
import { RoleRegistry } from "@rollthecloudinc/utils";

export const autoFillSteps = ({ group, registry, mouseTarget, cursor, content }: { group: string, registry: RoleRegistry, mouseTarget: string, cursor: CursorOverlayService, content?: any }): TimelineStep[] => {
    let step = 0
    return [
        {
            group,
            weight: step++,
            autoContinue: false,
            cursorBehavior: "click-item",
            title: 'Fill in Form',
            run: async ctx => {
                console.log('Fill in Form');
                const c = await waitForComponent('editor', undefined, 0, registry)
                const t = resolveTargetElement(c, mouseTarget);
                cursor.moveTo(t)
                await setTimeout(() => {
                    if(content) {
                        c.setFillContent(content)
                    }
                    c.fill()
                }, 1000)
            }
        },
        {
            group,
            weight: step++,
            autoContinue: false,
            cursorBehavior: "click-item",
            title: 'Save the form',
            run: async ctx => {
                console.log("Save the form");
                const c = await waitForComponent('editor', undefined, 0, registry)
                const t = resolveTargetElement(c, mouseTarget);
                cursor.moveTo(t)
                await setTimeout(() => c.submit(), 1000)
            }
        }
    ]
}