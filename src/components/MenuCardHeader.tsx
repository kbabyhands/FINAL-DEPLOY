
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

interface MenuCardHeaderProps {
  title: string;
  description: string;
}

const MenuCardHeader = ({ title, description }: MenuCardHeaderProps) => {
  return (
    <DialogHeader className="relative">
      {/* Mobile-friendly close button in header */}
      <div className="flex items-center justify-between mb-2">
        <DialogClose asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 md:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute -top-2 -right-2 md:hidden h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogClose>
      </div>
      
      <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
      <DialogDescription className="text-lg">
        {description}
      </DialogDescription>
    </DialogHeader>
  );
};

export default MenuCardHeader;
