import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONTENT_TEMPLATES, TEMPLATE_CATEGORIES, ContentTemplate } from '@/lib/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: ContentTemplate) => void;
  selectedTemplateId?: string;
}

export const TemplateSelector = ({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);

  const filteredTemplates = selectedCategory === 'all' 
    ? CONTENT_TEMPLATES 
    : CONTENT_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Choose a Content Template</h3>
          <p className="text-sm text-muted-foreground">
            Start with a proven framework to guide your content creation
          </p>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {TEMPLATE_CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <Badge variant="secondary" className="capitalize">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{template.structure.length} sections</span>
                    <span>~{template.estimatedWords} words</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onSelectTemplate(template)}
                    >
                      {selectedTemplateId === template.id ? 'Selected' : 'Use Template'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{previewTemplate?.icon}</span>
              <div>
                <DialogTitle>{previewTemplate?.name}</DialogTitle>
                <DialogDescription>{previewTemplate?.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Template Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>{' '}
                    <Badge variant="secondary" className="capitalize ml-1">
                      {previewTemplate?.category}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Length:</span>{' '}
                    <span className="font-medium">~{previewTemplate?.estimatedWords} words</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Content Structure</h4>
                <ol className="space-y-2">
                  {previewTemplate?.structure.map((section, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{section}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-3">AI Generation Prompt</h4>
                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                  {previewTemplate?.promptTemplate}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (previewTemplate) {
                onSelectTemplate(previewTemplate);
                setPreviewTemplate(null);
              }
            }}>
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
