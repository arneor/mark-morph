import { useParams } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useCampaigns, useCreateCampaign, useDeleteCampaign } from "@/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Eye, MousePointerClick, Image as ImageIcon } from "lucide-react";
import { insertCampaignSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertCampaignSchema.pick({
  title: true,
  type: true,
  contentUrl: true,
  duration: true,
});

type FormValues = z.infer<typeof formSchema>;

export default function Campaigns() {
  const { id } = useParams();
  const businessId = parseInt(id || "0");
  const { data: campaigns, isLoading } = useCampaigns(businessId);
  const createMutation = useCreateCampaign();
  const deleteMutation = useDeleteCampaign();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "banner",
      contentUrl: "",
      duration: 5,
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate({ ...data, businessId }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar businessId={businessId} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar businessId={businessId} />
      
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Ad Campaigns</h1>
              <p className="text-muted-foreground mt-1">Create and manage ads displayed on your splash page.</p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" /> Create New Ad
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Campaign</DialogTitle>
                  <DialogDescription>Add a new advertisement to your rotation.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer Sale" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="banner">Image Banner</SelectItem>
                              <SelectItem value="static">Static Text</SelectItem>
                              <SelectItem value="video">Video (Premium)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contentUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (seconds)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={3} 
                              max={30}
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create Campaign"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60 group">
                <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                  {/* Unsplash fallback comment for image url handling */}
                  {/* dynamic ad content */}
                  <img 
                    src={campaign.contentUrl} 
                    alt={campaign.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="text-muted-foreground"><svg class="w-12 h-12" ...><path ...></svg></div>');
                    }}
                  />
                  {!campaign.contentUrl && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-medium text-white uppercase">
                    {campaign.type}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground">Display: {campaign.duration}s</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                      onClick={() => deleteMutation.mutate({ id: campaign.id, businessId })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{campaign.views?.toLocaleString() || 0} Views</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MousePointerClick className="w-4 h-4" />
                      <span>{campaign.clicks?.toLocaleString() || 0} Clicks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!campaigns || campaigns.length === 0) && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-gray-50/50">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Megaphone className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No campaigns yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-1 mb-4">Create your first ad to start promoting your business to WiFi users.</p>
                <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create Campaign</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
