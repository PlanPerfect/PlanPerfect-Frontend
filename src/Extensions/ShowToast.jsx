import { toaster } from "@/components/ui/toaster"

export default function ShowToast(type, title, description, options = {}) {
    if (options.promise) {
        return toaster.promise(options.promise, {
            loading: {
                title: options.loading?.title || "Loading...",
                description: options.loading?.description || "",
            },
            success: options.success || {
                title: title,
                description: description,
            },
            error: options.error || {
                title: "Error",
                description: "Something went wrong",
            },
        });
    }

    toaster.create({
        type: type !== null ? type : "info",
        title: title !== null ? title : "",
        description: description !== null ? description : "",
        duration: options.duration || 4500,
        action: options.action || undefined,
    });
}