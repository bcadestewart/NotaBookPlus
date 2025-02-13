import { Card, CardContent } from "@mui/material";

export default function NoteViewer({ note }) {
  return (
    <div className="flex-1 p-6">
      <Card>
        <CardContent>
          <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
          <p className="text-gray-700">{note.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}