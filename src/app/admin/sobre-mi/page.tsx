"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropper } from "@/components/admin/image-cropper";

interface AboutData {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  enfoque: string;
  estudio: string;
  estudioDetalle: string;
  artistPhotoUrl: string;
  homePreviewText: string;
  homePreviewText2: string;
}

const defaultData: AboutData = {
  title: "Sobre el artista",
  subtitle: "Dante Tattoo — Since 2017",
  paragraph1:
    "Bienvenido a Dante Tattoo, donde cada trazo tiene un propósito y cada pieza cuenta una historia. Mi filosofía es simple: hacemos amigos, no clientes.",
  paragraph2:
    "Desde mis primeros trazos supe que el tatuaje era más que tinta en la piel — es una conversación entre artista y persona, un acto de confianza que se transforma en arte permanente.",
  paragraph3:
    "Cada sesión es única porque cada persona es única. Me tomo el tiempo necesario para entender tu visión, tu historia y lo que quieres expresar. No me interesa hacer tatuajes rápidos — me interesa crear piezas que te hagan sonreír cada vez que las veas.",
  enfoque:
    "Trabajo diversos estilos: realismo, blackwork, tradicional, neotradicional, lettering y diseños personalizados. Pero más allá del estilo, lo que me define es la atención al detalle y el compromiso con la calidad.",
  estudio:
    "El estudio es un espacio diseñado para que te sientas cómodo desde el momento en que entras. Limpieza, higiene y los más altos estándares de seguridad son la base de todo lo que hacemos.",
  estudioDetalle:
    "Usamos tintas premium, equipos de primera línea y seguimos estrictamente los protocolos de esterilización. Tu seguridad y comodidad son nuestra prioridad absoluta.",
  artistPhotoUrl: "",
  homePreviewText:
    "Con años de experiencia en el arte del tatuaje, cada pieza que creo es una colaboración entre el artista y la persona. Mi filosofía es simple: aquí no tienes citas, tienes encuentros con un amigo.",
  homePreviewText2:
    "Especializado en diversos estilos, desde realismo hasta tradicional, me apasiona transformar tus ideas en arte permanente que refleje tu personalidad y tu historia.",
};

export default function AdminSobreMiPage() {
  const [data, setData] = useState<AboutData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings?key=about")
      .then((r) => r.json())
      .then((val) => {
        if (val) setData({ ...defaultData, ...val });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "about", value: data }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof AboutData, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
  };

  if (loading) {
    return <p className="py-8 text-center text-neutral-400">Cargando...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sobre mí</h1>
          <p className="text-sm text-neutral-400">Edita el contenido de la sección &quot;Sobre el artista&quot;</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-brand-amber text-brand-dark hover:bg-brand-amber-dark"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">Foto del artista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-neutral-400">Se recorta a proporción 3:4 para mantener uniformidad.</p>
            <ImageCropper
              aspectRatio={3 / 4}
              currentImage={data.artistPhotoUrl || undefined}
              onUploadComplete={(url) => setData((d) => ({ ...d, artistPhotoUrl: url }))}
              label={data.artistPhotoUrl ? "Cambiar foto" : "Subir foto"}
            />
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">Página &quot;Sobre mí&quot;</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-white">Título</Label>
                <Input value={data.title} onChange={(e) => update("title", e.target.value)} className="border-neutral-700 bg-neutral-800" />
              </div>
              <div>
                <Label className="text-white">Subtítulo</Label>
                <Input value={data.subtitle} onChange={(e) => update("subtitle", e.target.value)} className="border-neutral-700 bg-neutral-800" />
              </div>
            </div>

            <div>
              <Label className="text-white">Introducción</Label>
              <Textarea value={data.paragraph1} onChange={(e) => update("paragraph1", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>
            <div>
              <Label className="text-white">Historia</Label>
              <Textarea value={data.paragraph2} onChange={(e) => update("paragraph2", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>
            <div>
              <Label className="text-white">Filosofía</Label>
              <Textarea value={data.paragraph3} onChange={(e) => update("paragraph3", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>

            <div>
              <Label className="text-white">Mi enfoque</Label>
              <Textarea value={data.enfoque} onChange={(e) => update("enfoque", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>

            <div>
              <Label className="text-white">El estudio</Label>
              <Textarea value={data.estudio} onChange={(e) => update("estudio", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>
            <div>
              <Label className="text-white">Detalle del estudio</Label>
              <Textarea value={data.estudioDetalle} onChange={(e) => update("estudioDetalle", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-white">Preview en página de inicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Texto principal (inicio)</Label>
              <Textarea value={data.homePreviewText} onChange={(e) => update("homePreviewText", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>
            <div>
              <Label className="text-white">Texto secundario (inicio)</Label>
              <Textarea value={data.homePreviewText2} onChange={(e) => update("homePreviewText2", e.target.value)} rows={3} className="border-neutral-700 bg-neutral-800" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
