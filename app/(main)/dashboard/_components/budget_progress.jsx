"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { updateBudget } from "@/actions/budget";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newbudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const percentageUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updateBudgetResponse,
    error: updateBudgetError,
  } = useFetch(updateBudget);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newbudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    toast.promise(updateBudgetFn(amount), {
      loading: "Updating Budget...",
      success: "Budget updated successfully",
      error: "Error while updating budget",
    });

    await updateBudgetFn(amount);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle>Monthly Budget (Default Account)</CardTitle>
            <div className="flex items-center gap-3 mt-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newbudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-32"
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUpdateBudget}
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardDescription>
                    {initialBudget
                      ? `$${currentExpenses.toFixed(
                          2
                        )} of $${initialBudget.amount.toFixed(2)} spent`
                      : "Please set a budget!"}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6"
                  >
                    <Pencil className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialBudget && (
            <div className="space-y-2">
              <Progress
                value={percentageUsed}
                extrastyles={`${
                  percentageUsed >= 90
                    ? "bg-red-500"
                    : percentageUsed >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
              <p className="text-xs text-muted-foreground text-right">
                {percentageUsed.toFixed(1)}% used
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetProgress;
