"use client";

import { useParams } from "next/navigation";
import { useEnrollmentFile } from "@/hooks";
import { notFound } from "next/navigation";

export default function EditEnrollmentFilePage() {
    const { id } = useParams();
    const { data, isLoading, error } = useEnrollmentFile(id as string);

    if (isLoading) return <div>Loading...</div>;
    if (error) return notFound();

    if (!data?.data) return notFound();

    console.log(data.data);

    return (
        <div>   
            <h1>Edit Enrollment File</h1>
            <p>{data.data.email}</p>
        </div>
    )
}