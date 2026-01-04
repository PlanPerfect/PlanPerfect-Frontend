import { toaster } from "@/components/ui/toaster"

export default function ShowToast(type, title, description) {
    toaster.create({
        type: type !== null ? type : "info",
        title: title !== null ? title : "",
        description: description !== null ? description : ""
    })
}