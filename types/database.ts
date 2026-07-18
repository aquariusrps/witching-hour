export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      board_posts: {
        Row: {
          author_id: string
          character_id: string | null
          content: string
          created_at: string
          flag_reason: string | null
          flagged_by: string | null
          id: string
          is_flagged: boolean
          is_ic: boolean
          thread_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          character_id?: string | null
          content: string
          created_at?: string
          flag_reason?: string | null
          flagged_by?: string | null
          id?: string
          is_flagged?: boolean
          is_ic?: boolean
          thread_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          character_id?: string | null
          content?: string
          created_at?: string
          flag_reason?: string | null
          flagged_by?: string | null
          id?: string
          is_flagged?: boolean
          is_ic?: boolean
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_posts_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "board_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      board_threads: {
        Row: {
          author_id: string
          board_id: string
          canon_source: string | null
          created_at: string
          id: string
          is_locked: boolean
          is_locked_for_edit: boolean
          is_pinned: boolean
          is_spoiler: boolean
          reply_count: number
          thread_type: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          board_id: string
          canon_source?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          is_locked_for_edit?: boolean
          is_pinned?: boolean
          is_spoiler?: boolean
          reply_count?: number
          thread_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          board_id?: string
          canon_source?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          is_locked_for_edit?: boolean
          is_pinned?: boolean
          is_spoiler?: boolean
          reply_count?: number
          thread_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_threads_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string
          description: string | null
          discord_announce: boolean
          display_order: number
          forced_theme: string | null
          icon_url: string | null
          id: string
          is_category: boolean
          is_rp_board: boolean
          last_post_at: string | null
          last_post_user_id: string | null
          min_level_required: number | null
          name: string
          parent_id: string | null
          post_count: number
          scope: string
          scope_id: string | null
          staff_only_threads: boolean
          thread_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discord_announce?: boolean
          display_order?: number
          forced_theme?: string | null
          icon_url?: string | null
          id?: string
          is_category?: boolean
          is_rp_board?: boolean
          last_post_at?: string | null
          last_post_user_id?: string | null
          min_level_required?: number | null
          name: string
          parent_id?: string | null
          post_count?: number
          scope?: string
          scope_id?: string | null
          staff_only_threads?: boolean
          thread_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discord_announce?: boolean
          display_order?: number
          forced_theme?: string | null
          icon_url?: string | null
          id?: string
          is_category?: boolean
          is_rp_board?: boolean
          last_post_at?: string | null
          last_post_user_id?: string | null
          min_level_required?: number | null
          name?: string
          parent_id?: string | null
          post_count?: number
          scope?: string
          scope_id?: string | null
          staff_only_threads?: boolean
          thread_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "boards_last_post_user_id_fkey"
            columns: ["last_post_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boards_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      character_level_thresholds: {
        Row: {
          created_at: string
          label: string
          level: number
          max_hp: number
          stat_points_awarded: number
          unlocks_description: string | null
          xp_required: number
        }
        Insert: {
          created_at?: string
          label: string
          level: number
          max_hp?: number
          stat_points_awarded?: number
          unlocks_description?: string | null
          xp_required: number
        }
        Update: {
          created_at?: string
          label?: string
          level?: number
          max_hp?: number
          stat_points_awarded?: number
          unlocks_description?: string | null
          xp_required?: number
        }
        Relationships: []
      }
      character_powers: {
        Row: {
          acquired_at: string
          character_id: string
          id: string
          power_description: string | null
          power_name: string
          source: string
        }
        Insert: {
          acquired_at?: string
          character_id: string
          id?: string
          power_description?: string | null
          power_name: string
          source: string
        }
        Update: {
          acquired_at?: string
          character_id?: string
          id?: string
          power_description?: string | null
          power_name?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_powers_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_relationships: {
        Row: {
          character_id: string
          created_at: string
          created_by: string
          id: string
          is_mutual: boolean
          related_character_id: string
          relationship_label: string | null
          relationship_type: string
        }
        Insert: {
          character_id: string
          created_at?: string
          created_by: string
          id?: string
          is_mutual?: boolean
          related_character_id: string
          relationship_label?: string | null
          relationship_type: string
        }
        Update: {
          character_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_mutual?: boolean
          related_character_id?: string
          relationship_label?: string | null
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_relationships_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_relationships_related_character_id_fkey"
            columns: ["related_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_revisions: {
        Row: {
          character_id: string
          created_at: string
          feedback: string | null
          id: string
          reviewer_id: string | null
          status_after: string
          status_before: string
        }
        Insert: {
          character_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          reviewer_id?: string | null
          status_after: string
          status_before: string
        }
        Update: {
          character_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          reviewer_id?: string | null
          status_after?: string
          status_before?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_revisions_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_xp_log: {
        Row: {
          amount: number
          awarded_by: string | null
          character_id: string
          created_at: string
          id: string
          reason: string
        }
        Insert: {
          amount: number
          awarded_by?: string | null
          character_id: string
          created_at?: string
          id?: string
          reason: string
        }
        Update: {
          amount?: number
          awarded_by?: string | null
          character_id?: string
          created_at?: string
          id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_xp_log_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          arcana: number
          aura: number
          avatar_url: string | null
          bio: string | null
          canon_source: string
          created_at: string
          faction_id: string | null
          id: string
          intuition: number
          is_npc: boolean
          last_combat_defeat_at: string | null
          level: number
          name: string
          pending_promotion: boolean
          status: string
          unspent_stat_points: number
          updated_at: string
          user_id: string
          vitality: number
          ward: number
          xp: number
        }
        Insert: {
          arcana?: number
          aura?: number
          avatar_url?: string | null
          bio?: string | null
          canon_source?: string
          created_at?: string
          faction_id?: string | null
          id?: string
          intuition?: number
          is_npc?: boolean
          last_combat_defeat_at?: string | null
          level?: number
          name: string
          pending_promotion?: boolean
          status?: string
          unspent_stat_points?: number
          updated_at?: string
          user_id: string
          vitality?: number
          ward?: number
          xp?: number
        }
        Update: {
          arcana?: number
          aura?: number
          avatar_url?: string | null
          bio?: string | null
          canon_source?: string
          created_at?: string
          faction_id?: string | null
          id?: string
          intuition?: number
          is_npc?: boolean
          last_combat_defeat_at?: string | null
          level?: number
          name?: string
          pending_promotion?: boolean
          status?: string
          unspent_stat_points?: number
          updated_at?: string
          user_id?: string
          vitality?: number
          ward?: number
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "characters_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      essence_log: {
        Row: {
          amount: number
          awarded_by: string | null
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          awarded_by?: string | null
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          awarded_by?: string | null
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "essence_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      factions: {
        Row: {
          ascension_chamber_label: string | null
          color_hex: string
          created_at: string
          description: string
          display_order: number
          id: string
          leader_title: string
          leader_user_id: string | null
          lore: string
          name: string
          promotions_board_id: string | null
          slug: string
        }
        Insert: {
          ascension_chamber_label?: string | null
          color_hex: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          leader_title?: string
          leader_user_id?: string | null
          lore?: string
          name: string
          promotions_board_id?: string | null
          slug: string
        }
        Update: {
          ascension_chamber_label?: string | null
          color_hex?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          leader_title?: string
          leader_user_id?: string | null
          lore?: string
          name?: string
          promotions_board_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "factions_promotions_board_id_fkey"
            columns: ["promotions_board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_bans: {
        Row: {
          banned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string
          reason: string | null
        }
        Insert: {
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          reason?: string | null
        }
        Update: {
          banned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          reason?: string | null
        }
        Relationships: []
      }
      mail_messages: {
        Row: {
          audience_id: string | null
          body: string
          created_at: string
          deleted_by_recipient: boolean
          deleted_by_sender: boolean
          id: string
          is_system_message: boolean
          is_welcome: boolean
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          subject: string
          system_message_audience: string | null
        }
        Insert: {
          audience_id?: string | null
          body: string
          created_at?: string
          deleted_by_recipient?: boolean
          deleted_by_sender?: boolean
          id?: string
          is_system_message?: boolean
          is_welcome?: boolean
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          subject: string
          system_message_audience?: string | null
        }
        Update: {
          audience_id?: string | null
          body?: string
          created_at?: string
          deleted_by_recipient?: boolean
          deleted_by_sender?: boolean
          id?: string
          is_system_message?: boolean
          is_welcome?: boolean
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          subject?: string
          system_message_audience?: string | null
        }
        Relationships: []
      }
      mojo_avatars: {
        Row: {
          character_id: string | null
          created_at: string
          expires_at: string | null
          faceclaim_id: string | null
          file_size: number | null
          height: number | null
          id: string
          mime_type: string
          storage_path: string
          title: string | null
          token: string
          width: number | null
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          expires_at?: string | null
          faceclaim_id?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string
          storage_path: string
          title?: string | null
          token: string
          width?: number | null
        }
        Update: {
          character_id?: string | null
          created_at?: string
          expires_at?: string | null
          faceclaim_id?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string
          storage_path?: string
          title?: string | null
          token?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mojo_avatars_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "mojo_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_avatars_faceclaim_id_fkey"
            columns: ["faceclaim_id"]
            isOneToOne: false
            referencedRelation: "mojo_faceclaims"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_character_resources: {
        Row: {
          character_id: string
          created_at: string
          id: string
          resource_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          resource_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mojo_character_resources_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "mojo_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_character_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "mojo_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_characters: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          faceclaim_id: string | null
          id: string
          name: string
          notes_misc: string | null
          notes_partners: string | null
          notes_plot: string | null
          primary_stack_id: string | null
          rp_id: string
          status: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          faceclaim_id?: string | null
          id?: string
          name: string
          notes_misc?: string | null
          notes_partners?: string | null
          notes_plot?: string | null
          primary_stack_id?: string | null
          rp_id: string
          status?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          faceclaim_id?: string | null
          id?: string
          name?: string
          notes_misc?: string | null
          notes_partners?: string | null
          notes_plot?: string | null
          primary_stack_id?: string | null
          rp_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mojo_characters_faceclaim_id_fkey"
            columns: ["faceclaim_id"]
            isOneToOne: false
            referencedRelation: "mojo_faceclaims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_characters_primary_stack_id_fkey"
            columns: ["primary_stack_id"]
            isOneToOne: false
            referencedRelation: "mojo_image_stacks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_characters_rp_id_fkey"
            columns: ["rp_id"]
            isOneToOne: false
            referencedRelation: "mojo_rps"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_faceclaims: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      mojo_familiar_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mojo_familiar_messages: {
        Row: {
          actions_taken: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          actions_taken?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          actions_taken?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mojo_familiar_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "mojo_familiar_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_grade_submissions: {
        Row: {
          bonus_points: number
          created_at: string
          grade_points: number | null
          grade_text: string | null
          graded_at: string | null
          id: string
          student_first_posted_at: string | null
          student_name: string
          thread_id: string
        }
        Insert: {
          bonus_points?: number
          created_at?: string
          grade_points?: number | null
          grade_text?: string | null
          graded_at?: string | null
          id?: string
          student_first_posted_at?: string | null
          student_name: string
          thread_id: string
        }
        Update: {
          bonus_points?: number
          created_at?: string
          grade_points?: number | null
          grade_text?: string | null
          graded_at?: string | null
          id?: string
          student_first_posted_at?: string | null
          student_name?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mojo_grade_submissions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "mojo_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_image_folders: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      mojo_image_stack_members: {
        Row: {
          created_at: string
          display_order: number
          id: string
          mime_type: string
          stack_id: string
          storage_path: string
          weight: number
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          mime_type?: string
          stack_id: string
          storage_path: string
          weight?: number
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          mime_type?: string
          stack_id?: string
          storage_path?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "mojo_image_stack_members_stack_id_fkey"
            columns: ["stack_id"]
            isOneToOne: false
            referencedRelation: "mojo_image_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_image_stacks: {
        Row: {
          character_id: string | null
          created_at: string
          expires_at: string | null
          faceclaim_id: string | null
          id: string
          label: string
          last_served_index: number | null
          last_served_member_id: string | null
          rotation_mode: string
          token: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          expires_at?: string | null
          faceclaim_id?: string | null
          id?: string
          label: string
          last_served_index?: number | null
          last_served_member_id?: string | null
          rotation_mode?: string
          token?: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          expires_at?: string | null
          faceclaim_id?: string | null
          id?: string
          label?: string
          last_served_index?: number | null
          last_served_member_id?: string | null
          rotation_mode?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "mojo_image_stacks_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "mojo_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_image_stacks_faceclaim_id_fkey"
            columns: ["faceclaim_id"]
            isOneToOne: false
            referencedRelation: "mojo_faceclaims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_image_stacks_last_served_member_id_fkey"
            columns: ["last_served_member_id"]
            isOneToOne: false
            referencedRelation: "mojo_image_stack_members"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_image_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          label: string | null
          mime_type: string
          storage_path: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          mime_type?: string
          storage_path: string
          token?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          mime_type?: string
          storage_path?: string
          token?: string
        }
        Relationships: []
      }
      mojo_partners: {
        Row: {
          created_at: string
          display_order: number
          handle: string
          history_notes: string | null
          id: string
          pace_notes: string | null
          sites: string | null
          style_notes: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          handle: string
          history_notes?: string | null
          id?: string
          pace_notes?: string | null
          sites?: string | null
          style_notes?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          handle?: string
          history_notes?: string | null
          id?: string
          pace_notes?: string | null
          sites?: string | null
          style_notes?: string | null
        }
        Relationships: []
      }
      mojo_personal_images: {
        Row: {
          created_at: string
          expires_at: string | null
          file_size: number | null
          folder_id: string | null
          id: string
          mime_type: string
          storage_path: string
          tags: string | null
          title: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          file_size?: number | null
          folder_id?: string | null
          id?: string
          mime_type?: string
          storage_path: string
          tags?: string | null
          title: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          file_size?: number | null
          folder_id?: string | null
          id?: string
          mime_type?: string
          storage_path?: string
          tags?: string | null
          title?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "mojo_personal_images_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "mojo_image_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_resources: {
        Row: {
          character_id: string | null
          content: string | null
          created_at: string
          display_order: number
          faceclaim_id: string | null
          id: string
          public_url: string | null
          storage_path: string | null
          title: string
          type: string
          url: string | null
        }
        Insert: {
          character_id?: string | null
          content?: string | null
          created_at?: string
          display_order?: number
          faceclaim_id?: string | null
          id?: string
          public_url?: string | null
          storage_path?: string | null
          title: string
          type: string
          url?: string | null
        }
        Update: {
          character_id?: string | null
          content?: string | null
          created_at?: string
          display_order?: number
          faceclaim_id?: string | null
          id?: string
          public_url?: string | null
          storage_path?: string | null
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mojo_resources_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "mojo_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_resources_faceclaim_id_fkey"
            columns: ["faceclaim_id"]
            isOneToOne: false
            referencedRelation: "mojo_faceclaims"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_rps: {
        Row: {
          color_hex: string
          created_at: string
          display_order: number
          id: string
          name: string
          notes_misc: string | null
          notes_partners: string | null
          notes_plot: string | null
          site_name: string
          site_url: string | null
          status: string
        }
        Insert: {
          color_hex?: string
          created_at?: string
          display_order?: number
          id?: string
          name: string
          notes_misc?: string | null
          notes_partners?: string | null
          notes_plot?: string | null
          site_name: string
          site_url?: string | null
          status?: string
        }
        Update: {
          color_hex?: string
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          notes_misc?: string | null
          notes_partners?: string | null
          notes_plot?: string | null
          site_name?: string
          site_url?: string | null
          status?: string
        }
        Relationships: []
      }
      mojo_snippets: {
        Row: {
          content: string
          created_at: string
          display_order: number
          id: string
          tags: string | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          id?: string
          tags?: string | null
          title: string
          type?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          id?: string
          tags?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      mojo_threads: {
        Row: {
          assignment_due_at: string | null
          character_id: string
          class_name: string | null
          completed_at: string | null
          created_at: string
          detected_platform: string | null
          display_order: number
          fetch_status: string | null
          first_poster: string | null
          id: string
          last_checked_at: string | null
          last_poster: string | null
          manual_whose_turn: string | null
          partner_names: string | null
          reply_order: string | null
          rp_id: string
          status: string
          thread_mode: string
          thread_type: string
          title: string
          url: string | null
        }
        Insert: {
          assignment_due_at?: string | null
          character_id: string
          class_name?: string | null
          completed_at?: string | null
          created_at?: string
          detected_platform?: string | null
          display_order?: number
          fetch_status?: string | null
          first_poster?: string | null
          id?: string
          last_checked_at?: string | null
          last_poster?: string | null
          manual_whose_turn?: string | null
          partner_names?: string | null
          reply_order?: string | null
          rp_id: string
          status?: string
          thread_mode?: string
          thread_type?: string
          title: string
          url?: string | null
        }
        Update: {
          assignment_due_at?: string | null
          character_id?: string
          class_name?: string | null
          completed_at?: string | null
          created_at?: string
          detected_platform?: string | null
          display_order?: number
          fetch_status?: string | null
          first_poster?: string | null
          id?: string
          last_checked_at?: string | null
          last_poster?: string | null
          manual_whose_turn?: string | null
          partner_names?: string | null
          reply_order?: string | null
          rp_id?: string
          status?: string
          thread_mode?: string
          thread_type?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mojo_threads_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "mojo_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_threads_rp_id_fkey"
            columns: ["rp_id"]
            isOneToOne: false
            referencedRelation: "mojo_rps"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_wanted: {
        Row: {
          character_id: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_token: string | null
          rp_id: string
          status: string
          title: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_token?: string | null
          rp_id: string
          status?: string
          title: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_token?: string | null
          rp_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mojo_wanted_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "mojo_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mojo_wanted_rp_id_fkey"
            columns: ["rp_id"]
            isOneToOne: false
            referencedRelation: "mojo_rps"
            referencedColumns: ["id"]
          },
        ]
      }
      mojo_wishlist: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_token: string | null
          notes: string | null
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_token?: string | null
          notes?: string | null
          status?: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_token?: string | null
          notes?: string | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ooc_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ooc_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "board_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      post_enchantments: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_enchantments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "board_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: string
          reported_by: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: string
          reported_by: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          reported_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "board_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          is_enabled: boolean
          permission_id: string
          role_id: string
        }
        Insert: {
          id?: string
          is_enabled?: boolean
          permission_id: string
          role_id: string
        }
        Update: {
          id?: string
          is_enabled?: boolean
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_invisible: boolean
          is_permanent: boolean
          name: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_invisible?: boolean
          is_permanent?: boolean
          name: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_invisible?: boolean
          is_permanent?: boolean
          name?: string
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      thread_reads: {
        Row: {
          id: string
          last_read_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_read_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_read_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_reads_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "board_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role_id: string
          scope_id: string | null
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role_id: string
          scope_id?: string | null
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role_id?: string
          scope_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active_character_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          essence: number
          id: string
          last_offering_at: string | null
          show_preference: string | null
          theme_preference: string | null
          watching_status: Json | null
        }
        Insert: {
          active_character_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          essence?: number
          id: string
          last_offering_at?: string | null
          show_preference?: string | null
          theme_preference?: string | null
          watching_status?: Json | null
        }
        Update: {
          active_character_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          essence?: number
          id?: string
          last_offering_at?: string | null
          show_preference?: string | null
          theme_preference?: string | null
          watching_status?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_active_character_id_fkey"
            columns: ["active_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          canon: string
          created_at: string | null
          email: string
          id: string
          name: string
          resend_id: string | null
        }
        Insert: {
          canon: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          resend_id?: string | null
        }
        Update: {
          canon?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          resend_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_character_xp: {
        Args: { p_amount: number; p_character_id: string }
        Returns: number
      }
      increment_user_essence: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      is_moderator: { Args: never; Returns: boolean }
      update_board_counts: {
        Args: {
          p_board_id: string
          p_last_post_at?: string
          p_last_post_uid?: string
          p_post_delta?: number
          p_thread_delta?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
