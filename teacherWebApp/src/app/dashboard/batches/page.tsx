import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import teacherAPI from "@/lib/api/teacher-api";

async function getData() {
  const teacherEmail = "teacher@example.com";
  
  try {
    const response = await teacherAPI.batches.getAll(teacherEmail);
    const batches = response.data?.batches || [];

    const transformedBatches = batches.map((b: any) => ({
      _id: b._id,
      name: b.name,
      code: b.code,
      course: { title: b.courseName },
      students: (b.students || []).map((s: any) => ({
        _id: s.studentId,
        name: s.studentName || 'Student',
        email: s.studentEmail || 'N/A'
      }))
    }));

    return { batches: transformedBatches };
  } catch (error) {
    console.error('Error:', error);
    return { batches: [] };
  }
}

export default async function BatchesPage() {
  const { batches } = await getData();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-headline font-bold">Batches</h1>

      <Card>
        <CardHeader>
          <CardTitle>Batch Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batches.map((b:any)=> (
              <div key={b._id} className="border rounded p-3">
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-muted-foreground">Course: {b.course?.title}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium">Students ({b.students?.length || 0})</p>
                  <div className="grid md:grid-cols-2 gap-1 mt-1">
                    {b.students?.map((s:any)=> (
                      <div key={s._id} className="text-sm text-muted-foreground">{s.name} • {s.email}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {batches.length === 0 && <p className="text-sm text-muted-foreground">No batches found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
